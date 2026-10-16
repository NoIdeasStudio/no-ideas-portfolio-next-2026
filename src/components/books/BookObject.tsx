'use client'

import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { useTexture } from '@react-three/drei'
import { suspend } from 'suspend-react'
import { spreadUv, type BookSpec, type FaceRect } from '../../data/books'
import { buildBook, disposeBook } from './buildBook'

const PAPER = '#f2efe6'

function configureMap(texture: THREE.Texture, color: boolean) {
  const colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
  const changed =
    texture.colorSpace !== colorSpace ||
    texture.anisotropy !== 8 ||
    texture.wrapS !== THREE.ClampToEdgeWrapping ||
    texture.wrapT !== THREE.ClampToEdgeWrapping
  texture.colorSpace = colorSpace
  texture.anisotropy = 8
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  // A second needsUpdate forces the GPU to upload the image again.
  if (changed || texture.version === 0) texture.needsUpdate = true
}

/** Foil stays smooth. The roughness map uses the green channel, so the mask is gray. */
function roughnessTextureFromFoil(foil: THREE.Texture) {
  const image = foil.image as CanvasImageSource & { width: number; height: number }
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')
  if (!context) return null
  context.drawImage(image, 0, 0)
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < pixels.data.length; i += 4) {
    const foilAmount = pixels.data[i] / 255
    const rough = Math.round((1 - foilAmount * 0.82) * 255)
    pixels.data[i] = rough
    pixels.data[i + 1] = rough
    pixels.data[i + 2] = rough
    pixels.data[i + 3] = 255
  }
  context.putImageData(pixels, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  configureMap(texture, false)
  texture.flipY = foil.flipY
  return texture
}

/**
 * Spot UV on white type clips, because the paper is already at full brightness.
 * The coat is drawn a little darker than the sheet and beveled at the edge,
 * so a reflection can lift it back up.
 */
function varnishFinish(cover: THREE.Texture, varnish: THREE.Texture) {
  const coverImage = cover.image as CanvasImageSource & { width: number; height: number }
  const varnishImage = varnish.image as CanvasImageSource & { width: number; height: number }
  const width = coverImage.width
  const height = coverImage.height
  const coverCanvas = document.createElement('canvas')
  coverCanvas.width = width
  coverCanvas.height = height
  const coverContext = coverCanvas.getContext('2d', { willReadFrequently: true })
  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = width
  maskCanvas.height = height
  const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true })
  if (!coverContext || !maskContext) return null
  coverContext.drawImage(coverImage, 0, 0, width, height)
  maskContext.drawImage(varnishImage, 0, 0, width, height)
  const coverPixels = coverContext.getImageData(0, 0, width, height)
  const mask = maskContext.getImageData(0, 0, width, height).data
  const roughData = new Uint8ClampedArray(coverPixels.data.length)
  const normalData = new Uint8ClampedArray(coverPixels.data.length)
  const radius = 5
  const coatedAt = (x: number, y: number) => {
    const cx = Math.max(0, Math.min(width - 1, x))
    const cy = Math.max(0, Math.min(height - 1, y))
    return mask[(cy * width + cx) * 4] / 255
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const coated = mask[i] / 255
      const shade = 1 - coated * 0.18
      coverPixels.data[i] = Math.round(coverPixels.data[i] * shade)
      coverPixels.data[i + 1] = Math.round(coverPixels.data[i + 1] * shade)
      coverPixels.data[i + 2] = Math.round(coverPixels.data[i + 2] * shade)
      const rough = Math.round((1 - coated * 0.92) * 255)
      roughData[i] = rough
      roughData[i + 1] = rough
      roughData[i + 2] = rough
      roughData[i + 3] = 255
      const dx = coatedAt(x + radius, y) - coatedAt(x - radius, y)
      const dy = coatedAt(x, y + radius) - coatedAt(x, y - radius)
      let nx = -dx * 1.2
      let ny = -dy * 1.2
      let nz = 1
      const length = Math.hypot(nx, ny, nz) || 1
      nx /= length
      ny /= length
      nz /= length
      normalData[i] = Math.round((nx * 0.5 + 0.5) * 255)
      normalData[i + 1] = Math.round((ny * 0.5 + 0.5) * 255)
      normalData[i + 2] = Math.round((nz * 0.5 + 0.5) * 255)
      normalData[i + 3] = 255
    }
  }
  coverContext.putImageData(coverPixels, 0, 0)
  const roughCanvas = document.createElement('canvas')
  roughCanvas.width = width
  roughCanvas.height = height
  const roughContext = roughCanvas.getContext('2d')
  const normalCanvas = document.createElement('canvas')
  normalCanvas.width = width
  normalCanvas.height = height
  const normalContext = normalCanvas.getContext('2d')
  if (!roughContext || !normalContext) return null
  roughContext.putImageData(new ImageData(roughData, width, height), 0, 0)
  normalContext.putImageData(new ImageData(normalData, width, height), 0, 0)
  const map = new THREE.CanvasTexture(coverCanvas)
  const roughnessMap = new THREE.CanvasTexture(roughCanvas)
  const clearcoatNormalMap = new THREE.CanvasTexture(normalCanvas)
  configureMap(map, true)
  configureMap(roughnessMap, false)
  configureMap(clearcoatNormalMap, false)
  map.flipY = cover.flipY
  roughnessMap.flipY = cover.flipY
  clearcoatNormalMap.flipY = cover.flipY
  return { map, roughnessMap, clearcoatNormalMap }
}

type CachedFinish = {
  map: THREE.Texture | null
  roughnessMap: THREE.Texture | null
  clearcoatNormalMap: THREE.Texture | null
}

/** Derived print maps, kept for the session so a return visit does not rebuild them. */
const finishCache = new Map<string, CachedFinish>()

function ensureFinish(
  slug: string,
  cover: THREE.Texture,
  foil: THREE.Texture | null,
  varnish: THREE.Texture | null,
) {
  const cached = finishCache.get(slug)
  if (cached) return cached
  const computed = varnish ? varnishFinish(cover, varnish) : null
  const finish: CachedFinish = {
    map: computed?.map ?? null,
    roughnessMap: foil ? roughnessTextureFromFoil(foil) : computed?.roughnessMap ?? null,
    clearcoatNormalMap: computed?.clearcoatNormalMap ?? null,
  }
  finishCache.set(slug, finish)
  return finish
}

function printMaterial(
  slug: string,
  cover: THREE.Texture,
  foil: THREE.Texture | null,
  varnish: THREE.Texture | null,
  bump: THREE.Texture | null,
  bumpScale: number,
) {
  const finish = ensureFinish(slug, cover, foil, varnish)
  // Clearcoat is a second shading pass. Books without varnish stay on the cheaper material.
  const material = varnish
    ? new THREE.MeshPhysicalMaterial({
        map: finish.map ?? cover,
        roughness: 0.94,
        roughnessMap: finish.roughnessMap,
        metalness: 0,
        clearcoat: 1,
        clearcoatMap: varnish,
        clearcoatNormalMap: finish.clearcoatNormalMap,
        clearcoatNormalScale: new THREE.Vector2(0.35, 0.35),
        clearcoatRoughness: 0.04,
        bumpMap: bump,
        bumpScale,
        specularIntensity: 0.85,
        side: THREE.DoubleSide,
      })
    : new THREE.MeshStandardMaterial({
        map: cover,
        roughness: 0.94,
        roughnessMap: finish.roughnessMap,
        metalness: foil ? 0.62 : 0,
        metalnessMap: foil,
        bumpMap: bump,
        bumpScale,
        side: THREE.DoubleSide,
      })
  return material
}

function caseMaterial(color: string) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.96,
    metalness: 0,
  })
}

function pageMaterial() {
  return new THREE.MeshStandardMaterial({
    color: PAPER,
    roughness: 0.95,
    metalness: 0,
  })
}

function pageEdgeMaterial(pageCount: number, depthMm: number) {
  const sheets = Math.max(10, Math.min(pageCount, Math.round(depthMm / 1.15)))
  const band = 8
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = sheets * band
  const context = canvas.getContext('2d')
  if (!context) return pageMaterial()
  for (let i = 0; i < sheets; i++) {
    const y = i * band
    context.fillStyle = '#f3eee4'
    context.fillRect(0, y, canvas.width, band)
    context.fillStyle = '#8d7f6c'
    context.fillRect(0, y, canvas.width, 3)
  }
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 8
  map.magFilter = THREE.LinearFilter
  map.minFilter = THREE.LinearFilter
  map.generateMipmaps = false
  map.needsUpdate = true
  const material = new THREE.MeshStandardMaterial({
    map,
    roughness: 0.86,
    metalness: 0,
    side: THREE.DoubleSide,
  })
  material.userData.ownedMap = map
  return material
}

function headbandMaterial(color: string) {
  const base = new THREE.Color(color)
  const dark = base.clone().multiplyScalar(0.32)
  const light = base.clone().lerp(new THREE.Color('#f3efe6'), 0.62)
  const css = (swatch: THREE.Color) => `#${swatch.getHexString()}`
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 160
  const context = canvas.getContext('2d')
  if (!context) return pageMaterial()
  for (let y = 0; y < canvas.height; y++) {
    const thread = y % 5
    context.fillStyle = thread === 0 ? css(dark) : thread === 3 ? css(light) : css(base)
    context.fillRect(0, y, canvas.width, 1)
  }
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 8
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.RepeatWrapping
  map.needsUpdate = true
  const material = new THREE.MeshStandardMaterial({
    map,
    roughness: 0.78,
    metalness: 0,
  })
  material.userData.ownedMap = map
  return material
}

function hingeMaterial() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 4
  const context = canvas.getContext('2d')
  if (!context) return pageMaterial()
  const gradient = context.createLinearGradient(0, 0, canvas.width, 0)
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(0.5, '#9a9a9a')
  gradient.addColorStop(1, '#ffffff')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.NoColorSpace
  map.needsUpdate = true
  const material = new THREE.MeshBasicMaterial({
    map,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.DstColorFactor,
    blendDst: THREE.ZeroFactor,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  })
  material.userData.ownedMap = map
  return material
}

function preparePrintTextures(
  cover: THREE.Texture,
  foil: THREE.Texture | null,
  varnish: THREE.Texture | null,
  bump: THREE.Texture | null,
) {
  configureMap(cover, true)
  if (foil) configureMap(foil, false)
  if (varnish) configureMap(varnish, false)
  if (bump) {
    configureMap(bump, false)
    // A hard impression. Mipmaps would blur the plate into a dark blob.
    bump.generateMipmaps = false
    bump.minFilter = THREE.LinearFilter
    bump.magFilter = THREE.LinearFilter
  }
}

function useBookGroup(
  book: BookSpec,
  cover: THREE.Texture,
  foil: THREE.Texture | null,
  varnish: THREE.Texture | null,
  bump: THREE.Texture | null,
  bumpScale: number,
) {
  const group = useMemo(() => {
    preparePrintTextures(cover, foil, varnish, bump)
    const print = printMaterial(book.slug, cover, foil, varnish, bump, bumpScale)
    const caseMat = caseMaterial(book.caseColor)
    const page = pageMaterial()
    const depth = Math.max(0.8, book.spineMm - book.boardMm * 2)
    const pageEdge = pageEdgeMaterial(book.pageCount, depth)
    const headband = headbandMaterial(book.coverColor)
    const hinge = hingeMaterial()
    const built = buildBook(book, {
      print,
      case: caseMat,
      page,
      pageEdge,
      headband,
      hinge,
    })
    built.userData.materials = [print, caseMat, page, pageEdge, headband, hinge]
    return built
  }, [book, book.slug, cover, foil, varnish, bump, bumpScale])

  useLayoutEffect(() => {
    const materials = group.userData.materials as THREE.Material[]
    materials.forEach((material) => {
      const ownedMap = material.userData.ownedMap as THREE.Texture | undefined
      if (ownedMap) ownedMap.needsUpdate = true
    })
    return () => {
      disposeBook(group)
      materials.forEach((material) => {
      const generated = material.userData.generated as THREE.Texture[] | undefined
      generated?.forEach((texture) => texture.dispose())
        const ownedMap = material.userData.ownedMap as THREE.Texture | undefined
        ownedMap?.dispose()
        material.dispose()
      })
    }
  }, [group])

  return group
}

function facePixels(
  book: BookSpec,
  rect: FaceRect,
  width: number,
  height: number,
) {
  const uv = spreadUv(book)
  const faceV0 = uv.bottomBleed
  const faceV1 = 1 - uv.topBleed
  const vBottom = faceV0 + (faceV1 - faceV0) * rect.v
  const vTop = vBottom + (faceV1 - faceV0) * rect.h
  return {
    x: (uv.leftBleed + uv.back + uv.spine + uv.front * rect.u) * width,
    y: (1 - vTop) * height,
    w: uv.front * rect.w * width,
    h: (vTop - vBottom) * height,
  }
}

function canvasTexture(canvas: HTMLCanvasElement, color: boolean) {
  const texture = new THREE.CanvasTexture(canvas)
  configureMap(texture, color)
  return texture
}

type GeneratedMaps = {
  cover: THREE.Texture
  foil: THREE.Texture | null
  varnish: THREE.Texture | null
}

const generatedCache = new Map<string, GeneratedMaps>()

function generatedMaps(book: BookSpec): GeneratedMaps {
  const cached = generatedCache.get(book.slug)
  if (cached) return cached
  const uv = spreadUv(book)
  const bleed = book.bleedMm ?? 1.5
  const totalW = bleed * 2 + book.widthMm * 2 + book.spineMm
  const totalH = bleed * 2 + book.heightMm
  const width = 1024
  const height = Math.max(2, Math.round((width * totalH) / totalW))

  const coverCanvas = document.createElement('canvas')
  coverCanvas.width = width
  coverCanvas.height = height
  const coverCtx = coverCanvas.getContext('2d')
  if (!coverCtx) throw new Error('Could not draw a stand-in cover')
  coverCtx.fillStyle = book.coverColor
  coverCtx.fillRect(0, 0, width, height)

  const foilCanvas = document.createElement('canvas')
  foilCanvas.width = width
  foilCanvas.height = height
  const foilCtx = foilCanvas.getContext('2d')
  if (!foilCtx) throw new Error('Could not draw a foil mask')
  foilCtx.fillStyle = '#000'
  foilCtx.fillRect(0, 0, width, height)

  const varnishCanvas = document.createElement('canvas')
  varnishCanvas.width = width
  varnishCanvas.height = height
  const varnishCtx = varnishCanvas.getContext('2d')
  if (!varnishCtx) throw new Error('Could not draw a varnish mask')
  varnishCtx.fillStyle = '#000'
  varnishCtx.fillRect(0, 0, width, height)

  if (book.foil) {
    const rect = facePixels(book, book.foil.rect, width, height)
    coverCtx.fillStyle = book.foil.color
    coverCtx.fillRect(rect.x, rect.y, rect.w, rect.h)
    foilCtx.fillStyle = '#fff'
    foilCtx.fillRect(rect.x, rect.y, rect.w, rect.h)
  }

  if (book.varnish) {
    const rect = facePixels(book, book.varnish.rect, width, height)
    varnishCtx.fillStyle = '#fff'
    varnishCtx.fillRect(rect.x, rect.y, rect.w, rect.h)
  }

  // Touch uv so a bad spread fails loudly instead of painting the wrong panel.
  if (uv.front <= 0) throw new Error(`No front panel for ${book.slug}`)

  const maps: GeneratedMaps = {
    cover: canvasTexture(coverCanvas, true),
    foil: book.foil ? canvasTexture(foilCanvas, false) : null,
    varnish: book.varnish ? canvasTexture(varnishCanvas, false) : null,
  }
  generatedCache.set(book.slug, maps)
  return maps
}

function GeneratedBook({ book }: { book: BookSpec }) {
  const maps = useMemo(() => generatedMaps(book), [book])
  const group = useBookGroup(book, maps.cover, maps.foil, maps.varnish, null, 0)
  return <primitive object={group} />
}

function ImageBook({
  book,
}: {
  book: BookSpec & { maps: NonNullable<BookSpec['maps']> }
}) {
  const { maps } = book
  const cover = useTexture(maps.cover)
  const varnish = useTexture(maps.varnish ?? maps.cover)
  const foil = useTexture(maps.foil ?? maps.cover)
  const deboss = useTexture(maps.deboss ?? maps.cover)
  const bump = maps.deboss ? deboss : maps.varnish ? varnish : null
  const group = useBookGroup(
    book,
    cover,
    maps.foil ? foil : null,
    maps.varnish ? varnish : null,
    bump,
    maps.deboss ? -1.7 : maps.varnish ? 0.2 : 0,
  )
  return <primitive object={group} />
}

export function BookObject({ book }: { book: BookSpec }) {
  if (book.maps?.cover) {
    return <ImageBook book={book as BookSpec & { maps: NonNullable<BookSpec['maps']> }} />
  }
  return <GeneratedBook book={book} />
}

const textureLoads = new Map<string, Promise<THREE.Texture>>()
const warming = new Map<string, Promise<void>>()

function yieldFrame() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 32)
  })
}

function isPromise(value: unknown): value is Promise<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  )
}

function cachedTexture(result: unknown) {
  if (result instanceof THREE.Texture) return result
  if (Array.isArray(result) && result[0] instanceof THREE.Texture) return result[0]
  return null
}

/** Reuses the texture drei will return, so the fly-in does not decode the file again. */
function loadSharedTexture(url: string) {
  const pending = textureLoads.get(url)
  if (pending) return pending
  const promise = new Promise<THREE.Texture>((resolve, reject) => {
    useTexture.preload(url)
    const read = () => {
      try {
        const result = (
          suspend as (fn: () => Promise<unknown>, keys: unknown[]) => unknown
        )(() => Promise.reject(new Error(`Missing preload for ${url}`)), [TextureLoader, url])
        const texture = cachedTexture(result)
        if (!texture) {
          reject(new Error(`Preload for ${url} did not return a texture`))
          return
        }
        resolve(texture)
      } catch (error) {
        if (isPromise(error)) {
          error.then(read, reject)
          return
        }
        reject(error instanceof Error ? error : new Error(`Could not preload ${url}`))
      }
    }
    read()
  })
  textureLoads.set(url, promise)
  promise.catch(() => {
    if (textureLoads.get(url) === promise) textureLoads.delete(url)
  })
  return promise
}

function uploadTextures(
  gl: THREE.WebGLRenderer | null | undefined,
  textures: Array<THREE.Texture | null | undefined>,
) {
  if (!gl) return
  const seen = new Set<THREE.Texture>()
  for (const texture of textures) {
    if (!texture || seen.has(texture)) continue
    seen.add(texture)
    gl.initTexture(texture)
  }
}

function imageUrls(maps: NonNullable<BookSpec['maps']>) {
  return [...new Set([maps.cover, maps.foil, maps.varnish, maps.deboss].filter((url): url is string => Boolean(url)))]
}

async function prepareBook(book: BookSpec, gl?: THREE.WebGLRenderer | null) {
  if (book.maps?.cover) {
    const urls = imageUrls(book.maps)
    const textures = await Promise.all(urls.map((url) => loadSharedTexture(url)))
    const byUrl = new Map(urls.map((url, index) => [url, textures[index]]))
    const cover = byUrl.get(book.maps.cover)
    if (!cover) return
    const foil = book.maps.foil ? byUrl.get(book.maps.foil) ?? null : null
    const varnish = book.maps.varnish ? byUrl.get(book.maps.varnish) ?? null : null
    const deboss = book.maps.deboss ? byUrl.get(book.maps.deboss) ?? null : null
    const bump = deboss ?? varnish
    if (!finishCache.has(book.slug)) await yieldFrame()
    preparePrintTextures(cover, foil, varnish, bump)
    const finish = ensureFinish(book.slug, cover, foil, varnish)
    uploadTextures(gl, [
      cover,
      foil,
      varnish,
      deboss,
      finish.map,
      finish.roughnessMap,
      finish.clearcoatNormalMap,
    ])
    return
  }

  if (!generatedCache.has(book.slug) || !finishCache.has(book.slug)) await yieldFrame()
  const maps = generatedMaps(book)
  preparePrintTextures(maps.cover, maps.foil, maps.varnish, null)
  const finish = ensureFinish(book.slug, maps.cover, maps.foil, maps.varnish)
  uploadTextures(gl, [
    maps.cover,
    maps.foil,
    maps.varnish,
    finish.map,
    finish.roughnessMap,
    finish.clearcoatNormalMap,
  ])
}

/** Decode the next cover and build its print maps while the current one is resting. */
export function warmBook(book: BookSpec, gl?: THREE.WebGLRenderer | null) {
  const current = warming.get(book.slug)
  if (current) return current
  const job = prepareBook(book, gl).catch((error: unknown) => {
    warming.delete(book.slug)
    console.warn(`Could not prepare ${book.title}`, error)
  })
  warming.set(book.slug, job)
  return job
}
