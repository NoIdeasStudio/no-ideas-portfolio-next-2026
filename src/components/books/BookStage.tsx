'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { books, type BookSpec } from '../../data/books'
import { useProjectTheme } from '../../contexts/ProjectThemeContext'
import { BookObject, warmBook } from './BookObject'

const MAX_FRAME_WIDTH = 3840
const MAX_FRAME_HEIGHT = 2160

/** Device pixels, capped so the drawing buffer stays within 3840×2160. */
function framePixelRatio() {
  const width = Math.max(1, window.innerWidth)
  const height = Math.max(1, window.innerHeight)
  const withinFrame = Math.min(MAX_FRAME_WIDTH / width, MAX_FRAME_HEIGHT / height)
  return Math.max(1, Math.min(window.devicePixelRatio || 1, withinFrame))
}

const REST_X = -0.04
const REST_Y = 0.78
const PITCH_MIN = -0.6
const PITCH_MAX = 1.05
const DRAG_THRESHOLD = 8
const EXIT_DURATION = 0.4
const ENTER_DELAY = 0.32
const ENTER_MOVE = 0.62
const ENTER_SPIN = 0.72
/** Horizontal lean while the pointer is on the cover. */
const HOVER_YAW = 0.07
const HOVER_LAMBDA = 5

/** Past the viewport edge, with room for a rotated cover. */
function offscreenX(viewportWidth: number) {
  return viewportWidth / 2 + 200
}

type Pose = { x: number; y: number }
type HoverPointer = { x: number; y: number; inside: boolean }
type HoverPose = { yaw: number }

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return reduced
}

function ArrivingBook({
  book,
  direction,
  reduced,
  poseRef,
  tweening,
  dragging,
  pointerRef,
  hoverPose,
}: {
  book: BookSpec
  direction: 1 | -1
  reduced: boolean
  poseRef: React.MutableRefObject<Pose & { vx: number; vy: number }>
  tweening: React.MutableRefObject<boolean>
  dragging: React.MutableRefObject<boolean>
  pointerRef: React.MutableRefObject<HoverPointer>
  hoverPose: React.MutableRefObject<HoverPose>
}) {
  const group = useRef<THREE.Group>(null)
  const invalidate = useThree((state) => state.invalidate)
  const camera = useThree((state) => state.camera)
  const viewportWidth = useThree((state) => state.viewport.width)
  const raycaster = useRef(new THREE.Raycaster())
  const pointer = useRef(new THREE.Vector2())
  const bookCenter = useRef(new THREE.Vector3())
  const hover = useRef({ yaw: 0 })

  useEffect(() => {
    const object = group.current
    if (!object) return
    const startY = reduced ? REST_Y : REST_Y + direction * 0.45
    object.rotation.x = REST_X
    object.rotation.y = startY
    object.position.x = reduced ? 0 : direction * offscreenX(viewportWidth)
    poseRef.current.x = REST_X
    poseRef.current.y = REST_Y
    poseRef.current.vx = 0
    poseRef.current.vy = 0
    invalidate()
    if (reduced) {
      tweening.current = false
      return
    }

    tweening.current = true
    const move = gsap.to(object.position, {
      x: 0,
      duration: ENTER_MOVE,
      delay: ENTER_DELAY,
      ease: 'power3.out',
      onUpdate: invalidate,
    })
    const spin = gsap.to(object.rotation, {
      x: REST_X,
      y: REST_Y,
      duration: ENTER_SPIN,
      delay: ENTER_DELAY,
      ease: 'power3.out',
      onUpdate: () => {
        poseRef.current.x = object.rotation.x
        poseRef.current.y = object.rotation.y
        invalidate()
      },
      onComplete: () => {
        tweening.current = false
        invalidate()
      },
    })
    return () => {
      move.kill()
      spin.kill()
      tweening.current = false
    }
  }, [book.slug, direction, reduced, poseRef, tweening, dragging, invalidate, viewportWidth])

  useFrame((_, delta) => {
    const object = group.current
    if (!object || tweening.current) return
    const motion = poseRef.current
    if (!dragging.current) {
      const decay = Math.pow(0.045, delta)
      motion.vx *= decay
      motion.vy *= decay
      if (Math.abs(motion.vx) < 0.00002) motion.vx = 0
      if (Math.abs(motion.vy) < 0.00002) motion.vy = 0
      motion.y += motion.vx
      motion.x = THREE.MathUtils.clamp(motion.x + motion.vy, PITCH_MIN, PITCH_MAX)
    }
    const aim = pointerRef.current
    let targetYaw = 0
    if (!reduced && !dragging.current && aim.inside) {
      pointer.current.set(aim.x, aim.y)
      raycaster.current.setFromCamera(pointer.current, camera)
      const hit = raycaster.current.intersectObject(object, true)[0]
      if (hit) {
        bookCenter.current.set(0, 0, 0)
        bookCenter.current.project(camera)
        const influence = THREE.MathUtils.clamp((aim.x - bookCenter.current.x) / 0.22, -1, 1)
        targetYaw = -influence * HOVER_YAW
      }
    }
    const lean = hover.current
    lean.yaw = THREE.MathUtils.damp(lean.yaw, targetYaw, HOVER_LAMBDA, delta)
    if (Math.abs(lean.yaw) < 0.0001) lean.yaw = 0
    hoverPose.current.yaw = lean.yaw
    object.rotation.x = motion.x
    object.rotation.y = motion.y + lean.yaw
    const leaning = Math.abs(lean.yaw - targetYaw) > 0.0004
    if (!dragging.current && (motion.vx !== 0 || motion.vy !== 0 || leaning)) invalidate()
  })

  return (
    <group ref={group}>
      <BookObject book={book} />
    </group>
  )
}

function DepartingBook({
  book,
  direction,
  from,
  onDone,
}: {
  book: BookSpec
  direction: 1 | -1
  from: Pose
  onDone: () => void
}) {
  const group = useRef<THREE.Group>(null)
  const invalidate = useThree((state) => state.invalidate)
  const viewportWidth = useThree((state) => state.viewport.width)
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    const object = group.current
    if (!object) return
    object.rotation.x = from.x
    object.rotation.y = from.y
    const move = gsap.to(object.position, {
      x: direction * -offscreenX(viewportWidth),
      duration: EXIT_DURATION,
      ease: 'power2.out',
      onUpdate: invalidate,
      onComplete: () => done.current(),
    })
    const spin = gsap.to(object.rotation, {
      y: from.y - direction * 0.4,
      duration: EXIT_DURATION,
      ease: 'power2.out',
      onUpdate: invalidate,
    })
    return () => {
      move.kill()
      spin.kill()
    }
  }, [book.slug, direction, from.x, from.y, invalidate, viewportWidth])

  return (
    <group ref={group}>
      <BookObject book={book} />
    </group>
  )
}

function Scene({
  book,
  departing,
  direction,
  reduced,
  poseRef,
  tweening,
  dragging,
  pointerRef,
  hoverPose,
  onDeparted,
}: {
  book: BookSpec
  departing: { book: BookSpec; from: Pose } | null
  direction: 1 | -1
  reduced: boolean
  poseRef: React.MutableRefObject<Pose & { vx: number; vy: number }>
  tweening: React.MutableRefObject<boolean>
  dragging: React.MutableRefObject<boolean>
  pointerRef: React.MutableRefObject<HoverPointer>
  hoverPose: React.MutableRefObject<HoverPose>
  onDeparted: () => void
}) {
  return (
    <>
      <ambientLight intensity={0.48} />
      <directionalLight position={[280, 250, 520]} intensity={2.1} />
      <directionalLight position={[-320, 140, 180]} intensity={0.42} />
      <spotLight
        position={[220, 145, 260]}
        angle={0.5}
        penumbra={1}
        decay={0}
        intensity={2.6}
        color="#fff6ee"
      />
      <Suspense fallback={null}>
        <ArrivingBook
          key={book.slug}
          book={book}
          direction={direction}
          reduced={reduced}
          poseRef={poseRef}
          tweening={tweening}
          dragging={dragging}
          pointerRef={pointerRef}
          hoverPose={hoverPose}
        />
        {departing && (
          <DepartingBook
            book={departing.book}
            direction={direction}
            from={departing.from}
            onDone={onDeparted}
          />
        )}
      </Suspense>
    </>
  )
}

type BookStageProps = {
  /** Fill the parent section and let the page scroll. The standalone page covers the viewport. */
  contained?: boolean
  /** Arrow keys change books. Off while another homepage project is in view. */
  listenToKeys?: boolean
  /** Homepage: pause auto-scroll the same way a project carousel does. */
  onInteract?: () => void
}

export function BookStage({
  contained = false,
  listenToKeys = true,
  onInteract,
}: BookStageProps) {
  const theme = useProjectTheme()
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [departing, setDeparting] = useState<{ book: BookSpec; from: Pose } | null>(null)
  const direction = useRef<1 | -1>(1)
  const poseRef = useRef({ x: REST_X, y: REST_Y, vx: 0, vy: 0 })
  const tweening = useRef(false)
  const dragging = useRef(false)
  const pointerNdc = useRef<HoverPointer>({ x: 0, y: 0, inside: false })
  const hoverPose = useRef<HoverPose>({ yaw: 0 })
  const pointer = useRef({
    active: false,
    moved: false,
    captured: false,
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
  })
  const onInteractRef = useRef(onInteract)
  onInteractRef.current = onInteract
  const stage = useRef<HTMLDivElement>(null)
  const glRef = useRef<THREE.WebGLRenderer | null>(null)
  const invalidate = useRef(() => {})
  const [grabbing, setGrabbing] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [dpr, setDpr] = useState(1)

  useEffect(() => {
    const update = () => setDpr(framePixelRatio())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  const book = books[index]

  useEffect(() => {
    if (!departing) return
    const timer = window.setTimeout(() => {
      tweening.current = false
      setDeparting(null)
    }, (ENTER_DELAY + ENTER_SPIN) * 1000 + 400)
    return () => window.clearTimeout(timer)
  }, [departing])

  useEffect(() => {
    if (contained) return
    theme?.setActiveProjectSlug(book.slug)
    theme?.setActiveProjectTitle(book.title)
    return () => {
      theme?.setActiveProjectSlug(null)
      theme?.setActiveProjectTitle(null)
    }
  }, [book.slug, book.title, contained, theme])

  useEffect(() => {
    if (departing) return
    let cancelled = false
    let timer = 0
    const kick = () => {
      if (cancelled) return
      if (tweening.current || dragging.current || !glRef.current) {
        timer = window.setTimeout(kick, 160)
        return
      }
      const count = books.length
      const seen = new Set<number>([index])
      const order: BookSpec[] = []
      for (const delta of [1, -1, 2, -2, 3, -3]) {
        const nextIndex = ((index + delta) % count + count) % count
        if (seen.has(nextIndex)) continue
        seen.add(nextIndex)
        order.push(books[nextIndex])
      }
      void (async () => {
        for (const candidate of order) {
          while (!cancelled && (tweening.current || dragging.current)) {
            await new Promise<void>((resolve) => {
              window.setTimeout(resolve, 160)
            })
          }
          if (cancelled) return
          await warmBook(candidate, glRef.current)
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, 48)
          })
        }
      })()
    }
    timer = window.setTimeout(kick, 280)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [index, departing])

  function go(dir: 1 | -1) {
    if (departing || tweening.current) return
    onInteractRef.current?.()
    const next = (index + dir + books.length) % books.length
    if (!books[next].description) setInfoOpen(false)
    direction.current = dir
    const from = {
      x: poseRef.current.x,
      y: poseRef.current.y + hoverPose.current.yaw,
    }
    poseRef.current.vx = 0
    poseRef.current.vy = 0
    hoverPose.current.yaw = 0
    if (reduced) {
      setIndex(next)
      poseRef.current.x = REST_X
      poseRef.current.y = REST_Y
      return
    }
    setDeparting({ book, from })
    setIndex(next)
  }

  function toggleInfo() {
    setInfoOpen((open) => !open)
  }

  function stopStagePointer(event: React.PointerEvent) {
    event.stopPropagation()
  }

  const goRef = useRef(go)
  goRef.current = go

  useEffect(() => {
    if (!listenToKeys) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goRef.current(1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goRef.current(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [listenToKeys])

  function trackPointer(event: { clientX: number; clientY: number }) {
    const bounds = stage.current?.getBoundingClientRect()
    if (!bounds || bounds.width === 0 || bounds.height === 0) return
    pointerNdc.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    pointerNdc.current.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    pointerNdc.current.inside = true
    if (!dragging.current && !tweening.current) invalidate.current()
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    trackPointer(event)
    if (reduced || departing || tweening.current) return
    pointer.current = {
      active: true,
      moved: false,
      captured: !contained,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
    }
    if (contained) return
    dragging.current = true
    poseRef.current.vx = 0
    poseRef.current.vy = 0
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    trackPointer(event)
    const drag = pointer.current
    if (!drag.active) return
    if (contained && !drag.captured) {
      const travelX = Math.abs(event.clientX - drag.x)
      const travelY = Math.abs(event.clientY - drag.y)
      if (travelY > DRAG_THRESHOLD && travelY > travelX) {
        drag.active = false
        return
      }
      if (travelX <= DRAG_THRESHOLD) return
      drag.captured = true
      dragging.current = true
      poseRef.current.vx = 0
      poseRef.current.vy = 0
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    const dx = event.clientX - drag.lastX
    const dy = event.clientY - drag.lastY
    drag.lastX = event.clientX
    drag.lastY = event.clientY
    if (
      Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > DRAG_THRESHOLD
    ) {
      if (!drag.moved) onInteractRef.current?.()
      drag.moved = true
      setGrabbing(true)
    }
    if (!drag.moved) return
    poseRef.current.y += dx * 0.0058
    poseRef.current.x = THREE.MathUtils.clamp(
      poseRef.current.x + dy * 0.0032,
      PITCH_MIN,
      PITCH_MAX,
    )
    poseRef.current.vx = dx * 0.0016
    poseRef.current.vy = dy * 0.0008
    invalidate.current()
  }

  function onPointerLeave() {
    pointerNdc.current.inside = false
    if (!tweening.current) invalidate.current()
  }

  function onPointerUp() {
    const drag = pointer.current
    if (!drag.active) return
    drag.active = false
    dragging.current = false
    setGrabbing(false)
    invalidate.current()
  }

  return (
    <div
      ref={stage}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
      style={{
        position: contained ? 'absolute' : 'fixed',
        inset: 0,
        touchAction: contained ? 'pan-y' : 'none',
        cursor: reduced ? 'default' : grabbing ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      <Canvas
        frameloop="demand"
        camera={{ fov: 28, position: [0, 0, 680], near: 20, far: 2500 }}
        dpr={dpr}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl, invalidate: requestFrame }) => {
          glRef.current = gl
          gl.setScissorTest(false)
          gl.autoClear = true
          gl.setClearColor('#000000')
          gl.toneMapping = THREE.NeutralToneMapping
          gl.toneMappingExposure = 1.05
          invalidate.current = requestFrame
        }}
      >
        <Scene
          book={book}
          departing={reduced ? null : departing}
          direction={direction.current}
          reduced={reduced}
          poseRef={poseRef}
          tweening={tweening}
          dragging={dragging}
          pointerRef={pointerNdc}
          hoverPose={hoverPose}
          onDeparted={() => setDeparting(null)}
        />
      </Canvas>
      <button
        type="button"
        aria-label="Previous book"
        onClick={() => go(-1)}
        onPointerDown={(event) => event.stopPropagation()}
        className="absolute left-0 top-0 z-10 h-full w-[30%] cursor-w-resize border-0 bg-transparent p-0 focus:outline-none"
        style={{
          pointerEvents: grabbing ? 'none' : 'auto',
          touchAction: contained ? 'pan-y' : 'none',
        }}
      />
      <button
        type="button"
        aria-label="Next book"
        onClick={() => go(1)}
        onPointerDown={(event) => event.stopPropagation()}
        className="absolute right-0 top-0 z-10 h-full w-[30%] cursor-e-resize border-0 bg-transparent p-0 focus:outline-none"
        style={{
          pointerEvents: grabbing ? 'none' : 'auto',
          touchAction: contained ? 'pan-y' : 'none',
        }}
      />

      <div
        className="absolute bottom-0 left-0 z-20 max-w-[80%] py-[1.3%] px-[2%] pointer-events-none project-carousel-chrome project-carousel-chrome--desktop"
      >
        <div className="type-primary pointer-events-auto" onPointerDown={stopStagePointer}>
          {book.description && (
            <button
              type="button"
              onClick={toggleInfo}
              className="project-info-trigger block cursor-pointer text-left font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
              aria-expanded={infoOpen}
              aria-controls="book-cover-info"
            >
              Info
            </button>
          )}
        </div>
      </div>

      <div className="project-carousel-chrome project-carousel-chrome--mobile">
        <div
          className="type-primary project-carousel-bottom-mobile"
          onPointerDown={stopStagePointer}
        >
          {book.description ? (
            <button
              type="button"
              onClick={toggleInfo}
              className={`project-title-btn project-name-btn cursor-pointer font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2${infoOpen ? ' is-open' : ''}`}
              aria-expanded={infoOpen}
              aria-controls="book-cover-info"
            >
              {book.title}
            </button>
          ) : (
            <p className="project-carousel-mobile-title font-medium">{book.title}</p>
          )}
          <p className="project-carousel-slide-count" aria-live="polite">
            {index + 1} of {books.length}
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-0 right-0 z-10 cursor-auto py-[1.3%] px-[2%] project-carousel-chrome project-carousel-chrome--desktop"
        onPointerDown={stopStagePointer}
      >
        <p className="type-primary text-right" aria-live="polite">
          {index + 1} of {books.length}
        </p>
      </div>

      {infoOpen && book.description && (
        <div
          className="project-info-layer"
          role="dialog"
          aria-modal="false"
          aria-label="Project information"
          style={{ cursor: 'auto' }}
          onPointerDown={stopStagePointer}
        >
          <button
            type="button"
            className="project-info-backdrop"
            onClick={() => setInfoOpen(false)}
            aria-label="Close project information"
          />
          <div id="book-cover-info" className="project-info-half type-secondary">
            <div className="project-info-columns">
              <div className="project-info-main">
                <h2 className="project-info-heading">Info</h2>
                <div className="project-info-description">
                  <p className="project-info-para">{book.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
