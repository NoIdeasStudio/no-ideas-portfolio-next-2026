import * as THREE from 'three'
import { bleedMm, spreadUv, type BookSpec, type SpreadUv } from '../../data/books'

// Shoulder, then a shallow channel. Deep enough to read, not enough to clip through the board.
const HINGE_FROM_SPINE = 3
const HINGE_WIDTH = 10
const HINGE_DEPTH = 0.4

function plane(
  width: number,
  height: number,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
) {
  const geo = new THREE.PlaneGeometry(width, height)
  const uv = geo.attributes.uv
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(
      i,
      THREE.MathUtils.lerp(u0, u1, uv.getX(i)),
      THREE.MathUtils.lerp(v0, v1, uv.getY(i)),
    )
  }
  return geo
}

function addMesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
  rotation?: [number, number, number],
) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(position[0], position[1], position[2])
  if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2])
  parent.add(mesh)
  return mesh
}

/**
 * Spine strip. Ends sit on the board edge; the middle bulges toward -X.
 * `wrap` turns the bleed over the head and tail so the spine still has a
 * surface when the camera looks down the joint.
 */
function curvedSpine(
  thickness: number,
  height: number,
  bulge: number,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  wrap = 0,
  vBottom = 0,
  vTop = 1,
) {
  const segments = 16
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const push = (
    x: number,
    y: number,
    z: number,
    nx: number,
    ny: number,
    nz: number,
    u: number,
    v: number,
  ) => {
    const index = positions.length / 3
    positions.push(x, y, z)
    normals.push(nx, ny, nz)
    uvs.push(u, v)
    return index
  }

  const column: {
    x: number
    z: number
    nx: number
    nz: number
    u: number
    bottom: number
    top: number
  }[] = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const z = -thickness / 2 + thickness * t
    const x = -bulge * Math.sin(Math.PI * t)
    const dx = -bulge * Math.PI * Math.cos(Math.PI * t)
    const dz = thickness
    let nx = -dz
    let nz = dx
    const len = Math.hypot(nx, nz) || 1
    nx /= len
    nz /= len
    const u = THREE.MathUtils.lerp(u0, u1, t)
    const bottom = push(x, -height / 2, z, nx, 0, nz, u, v0)
    const top = push(x, height / 2, z, nx, 0, nz, u, v1)
    column.push({ x, z, nx, nz, u, bottom, top })
  }

  for (let i = 0; i < segments; i++) {
    const a = column[i]
    const b = column[i + 1]
    indices.push(a.bottom, b.bottom, a.top, a.top, b.bottom, b.top)
  }

  if (wrap > 0) {
    for (let i = 0; i < segments; i++) {
      const a = column[i]
      const b = column[i + 1]
      const aInX = a.x - a.nx * wrap
      const aInZ = a.z - a.nz * wrap
      const bInX = b.x - b.nx * wrap
      const bInZ = b.z - b.nz * wrap

      const aTop = push(a.x, height / 2, a.z, 0, 1, 0, a.u, v1)
      const bTop = push(b.x, height / 2, b.z, 0, 1, 0, b.u, v1)
      const aTopIn = push(aInX, height / 2, aInZ, 0, 1, 0, a.u, vTop)
      const bTopIn = push(bInX, height / 2, bInZ, 0, 1, 0, b.u, vTop)
      indices.push(aTop, bTop, bTopIn, aTop, bTopIn, aTopIn)

      const aBot = push(a.x, -height / 2, a.z, 0, -1, 0, a.u, v0)
      const bBot = push(b.x, -height / 2, b.z, 0, -1, 0, b.u, v0)
      const aBotIn = push(aInX, -height / 2, aInZ, 0, -1, 0, a.u, vBottom)
      const bBotIn = push(bInX, -height / 2, bInZ, 0, -1, 0, b.u, vBottom)
      indices.push(aBot, aBotIn, bBotIn, aBot, bBotIn, bBot)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  return geo
}

/** Smooth valley. Slope is zero at both ends, so the cover doesn't crack. */
function grooveZ(fromSpine: number) {
  const t = (fromSpine - HINGE_FROM_SPINE) / HINGE_WIDTH
  if (t <= 0 || t >= 1) return 0
  return (-HINGE_DEPTH * (1 - Math.cos(Math.PI * 2 * t))) / 2
}

function addPrintedFace(
  parent: THREE.Object3D,
  material: THREE.Material,
  width: number,
  height: number,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
  hinge: boolean,
  spineAtPositiveX: boolean,
) {
  if (!hinge) {
    addMesh(parent, plane(width, height, u0, v0, u1, v1), material, [0, 0, 0])
    return
  }

  const fromSpineSamples = [0, HINGE_FROM_SPINE]
  const grooveSteps = 18
  for (let i = 1; i < grooveSteps; i++) {
    fromSpineSamples.push(HINGE_FROM_SPINE + (HINGE_WIDTH * i) / grooveSteps)
  }
  fromSpineSamples.push(HINGE_FROM_SPINE + HINGE_WIDTH, width)

  const columns = fromSpineSamples.map((fromSpine) => {
    const x = spineAtPositiveX ? width / 2 - fromSpine : -width / 2 + fromSpine
    return { x, z: grooveZ(fromSpine), fromSpine }
  })
  columns.sort((a, b) => a.x - b.x)

  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const push = (x: number, y: number, z: number, nx: number, nz: number, u: number, v: number) => {
    const index = positions.length / 3
    positions.push(x, y, z)
    normals.push(nx, 0, nz)
    uvs.push(u, v)
    return index
  }

  const cols = columns.map((column, i) => {
    const prev = columns[Math.max(0, i - 1)]
    const next = columns[Math.min(columns.length - 1, i + 1)]
    const dzdx = next.x === prev.x ? 0 : (next.z - prev.z) / (next.x - prev.x)
    const len = Math.hypot(-dzdx, 1)
    const nx = -dzdx / len
    const nz = 1 / len
    const u = THREE.MathUtils.lerp(u0, u1, (column.x + width / 2) / width)
    return {
      bottom: push(column.x, -height / 2, column.z, nx, nz, u, v0),
      top: push(column.x, height / 2, column.z, nx, nz, u, v1),
    }
  })

  for (let i = 0; i < cols.length - 1; i++) {
    const a = cols[i]
    const b = cols[i + 1]
    indices.push(a.bottom, b.bottom, a.top, a.top, b.bottom, b.top)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  addMesh(parent, geo, material, [0, 0, 0])
}

/** Jacket flap: around the fore-edge, then along the inside of the board. */
function addFold(
  parent: THREE.Object3D,
  material: THREE.Material,
  width: number,
  height: number,
  coverZ: number,
  thick: number,
  flapMm: number,
  uNear: number,
  uFar: number,
  v0: number,
  v1: number,
  zSign: number,
) {
  const span = uFar - uNear
  const turnMm = Math.min(flapMm, Math.max(thick, 0.4))
  const uTurn = uNear + span * (turnMm / flapMm)
  addMesh(
    parent,
    plane(turnMm, height, uNear, v0, uTurn, v1),
    material,
    [width / 2, 0, coverZ - zSign * (turnMm / 2)],
    [0, Math.PI / 2, 0],
  )

  const inner = flapMm - turnMm
  if (inner < 1) return
  const uEnd = uNear + span
  const faceIn = zSign > 0
  addMesh(
    parent,
    plane(inner, height, faceIn ? uTurn : uEnd, v0, faceIn ? uEnd : uTurn, v1),
    material,
    [width / 2 - inner / 2, 0, coverZ - zSign * (turnMm + 0.25)],
    faceIn ? [0, Math.PI, 0] : undefined,
  )
}

function addShell(
  parent: THREE.Group,
  book: BookSpec,
  uv: SpreadUv,
  material: THREE.Material,
  offset: number,
  hinge: boolean,
  hingeShadow: THREE.Material,
) {
  const { widthMm: width, heightMm: height, spineMm: spine } = book
  const frontZ = spine / 2 + offset
  const edge = Math.min(bleedMm(book), book.boardMm + Math.max(offset, 0.2) + 0.25)
  const bulge = book.binding === 'paperback' ? 0.35 : 2.2

  const v0 = uv.bottomBleed
  const v1 = 1 - uv.topBleed
  const backFlapU0 = uv.leftBleed
  const backFlapU1 = backFlapU0 + uv.backFlap
  const backU0 = backFlapU1
  const backU1 = backU0 + uv.back
  const spineU0 = backU1 + uv.backJoint
  const spineU1 = spineU0 + uv.spine
  const frontU0 = spineU1 + uv.frontJoint
  const frontU1 = frontU0 + uv.front
  const frontFlapU0 = frontU1
  const frontFlapU1 = frontFlapU0 + uv.frontFlap

  const front = new THREE.Group()
  front.position.z = frontZ
  addMesh(front, plane(width, height, frontU0, v0, frontU1, v1), material, [0, 0, 0])
  parent.add(front)

  const back = new THREE.Group()
  back.position.z = -frontZ
  back.rotation.y = Math.PI
  addMesh(back, plane(width, height, backU0, v0, backU1, v1), material, [0, 0, 0])
  parent.add(back)

  addMesh(
    parent,
    curvedSpine(spine + offset * 2, height, bulge, spineU0, v0, spineU1, v1, edge, 0, 1),
    material,
    [-width / 2, 0, 0],
  )

  // Bleed wraps the board edges so the jacket (or paper) isn't a raw cut.
  addMesh(
    parent,
    plane(width, edge, frontU0, v1, frontU1, 1),
    material,
    [0, height / 2, frontZ - edge / 2],
    [-Math.PI / 2, 0, 0],
  )
  addMesh(
    parent,
    plane(width, edge, frontU0, 0, frontU1, v0),
    material,
    [0, -height / 2, frontZ - edge / 2],
    [Math.PI / 2, 0, 0],
  )
  if (uv.frontFlap < 0.001) {
    addMesh(
      parent,
      plane(edge, height, frontU1, v0, frontU1 + uv.rightBleed, v1),
      material,
      [width / 2, 0, frontZ - edge / 2],
      [0, Math.PI / 2, 0],
    )
  }

  // The back face is spun 180°, so these flaps swap U and skip that extra turn.
  // Otherwise their normals point into the book and the head reads as raw board.
  addMesh(
    parent,
    plane(width, edge, backU1, 1, backU0, v1),
    material,
    [0, height / 2, -frontZ + edge / 2],
    [-Math.PI / 2, 0, 0],
  )
  addMesh(
    parent,
    plane(width, edge, backU1, v0, backU0, 0),
    material,
    [0, -height / 2, -frontZ + edge / 2],
    [Math.PI / 2, 0, 0],
  )
  // Left bleed is the back cover's fore-edge, which lands on +X after the turn.
  if (uv.backFlap < 0.001) {
    addMesh(
      parent,
      plane(edge, height, backU0 - uv.leftBleed, v0, backU0, v1),
      material,
      [width / 2, 0, -frontZ + edge / 2],
      [0, Math.PI / 2, 0],
    )
  }

  const spreadW = width / uv.front
  if (uv.frontFlap > 0.001) {
    addFold(
      parent,
      material,
      width,
      height,
      frontZ,
      book.boardMm + Math.max(offset, 0),
      uv.frontFlap * spreadW,
      frontFlapU0,
      frontFlapU1,
      v0,
      v1,
      1,
    )
  }
  if (uv.backFlap > 0.001) {
    addFold(
      parent,
      material,
      width,
      height,
      -frontZ,
      book.boardMm + Math.max(offset, 0),
      uv.backFlap * spreadW,
      backFlapU1,
      backFlapU0,
      v0,
      v1,
      -1,
    )
  }

  // The squares leave a raw board face between the pages and the jacket.
  // Turn the bleed down that face on the head and tail.
  if (book.squareMm > 0.4) {
    const turn = book.squareMm - 0.05
    const yHead = height / 2 - turn / 2 + 0.04
    const yTail = -yHead
    addMesh(
      parent,
      plane(width, turn, backU1, v1, backU0, Math.min(1, v1 + 0.004)),
      material,
      [0, yHead, -frontZ + edge],
    )
    addMesh(
      parent,
      plane(width, turn, backU1, Math.max(0, v0 - 0.004), backU0, v0),
      material,
      [0, yTail, -frontZ + edge],
    )
    addMesh(
      parent,
      plane(width, turn, frontU1, v1, frontU0, Math.min(1, v1 + 0.004)),
      material,
      [0, yHead, frontZ - edge],
      [0, Math.PI, 0],
    )
    addMesh(
      parent,
      plane(width, turn, frontU1, Math.max(0, v0 - 0.004), frontU0, v0),
      material,
      [0, yTail, frontZ - edge],
      [0, Math.PI, 0],
    )
  }

  if (hinge) {
    const shadowW = HINGE_WIDTH + 4
    const fromSpine = HINGE_FROM_SPINE + HINGE_WIDTH / 2
    const x = -width / 2 + fromSpine
    const frontShadow = addMesh(
      parent,
      plane(shadowW, height, 0, 0, 1, 1),
      hingeShadow,
      [x, 0, frontZ + 0.08],
    )
    const backShadow = addMesh(
      parent,
      plane(shadowW, height, 0, 0, 1, 1),
      hingeShadow,
      [x, 0, -frontZ - 0.08],
      [0, Math.PI, 0],
    )
    frontShadow.renderOrder = 4
    backShadow.renderOrder = 4
  }
}

function addCase(
  parent: THREE.Group,
  book: BookSpec,
  material: THREE.Material,
  outerClearance: number,
) {
  const { widthMm: width, heightMm: height, spineMm: spine, boardMm } = book
  const tuck = 0.7
  // Keep the outer face behind the hinge groove, or the light board shows as a line.
  const depth = Math.max(0.4, boardMm - outerClearance)
  const outer = spine / 2 - outerClearance
  addMesh(
    parent,
    new THREE.BoxGeometry(width - tuck * 2, height - tuck * 2, depth),
    material,
    [0, 0, outer - depth / 2],
  )
  addMesh(
    parent,
    new THREE.BoxGeometry(width - tuck * 2, height - tuck * 2, depth),
    material,
    [0, 0, -(outer - depth / 2)],
  )
  addMesh(
    parent,
    curvedSpine(spine - boardMm * 2, height - tuck * 2, 1, 0, 0, 1, 1),
    material,
    [-width / 2 + 0.8, 0, 0],
  )
}

/** Lines stack along V. `stackAlongWidth` uses that axis for the sheet stack. */
function pageEdgeGeometry(width: number, height: number, stackAlongWidth: boolean) {
  const geo = new THREE.PlaneGeometry(width, height)
  if (!stackAlongWidth) return geo
  const uv = geo.attributes.uv
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getY(i), uv.getX(i))
  }
  return geo
}

function addPages(
  parent: THREE.Group,
  book: BookSpec,
  material: THREE.Material,
  edgeMaterial: THREE.Material,
  headbandMaterial: THREE.Material,
) {
  const pageW = book.widthMm - book.squareMm
  const pageH = book.heightMm - book.squareMm * 2
  const pageD = Math.max(0.8, book.spineMm - book.boardMm * 2)
  const pageX = book.squareMm / 2
  const skin = 0.8

  addMesh(
    parent,
    new THREE.BoxGeometry(pageW - skin, pageH - skin * 2, pageD - skin),
    material,
    [pageX - skin / 2, 0, 0],
  )

  const lift = 0.35
  addMesh(
    parent,
    pageEdgeGeometry(pageD, pageH, true),
    edgeMaterial,
    [pageX + pageW / 2 - 0.08, 0, 0],
    [0, Math.PI / 2, 0],
  )
  addMesh(
    parent,
    pageEdgeGeometry(pageW, pageD, false),
    edgeMaterial,
    [pageX, pageH / 2 + lift, 0],
    [-Math.PI / 2, 0, 0],
  )
  addMesh(
    parent,
    pageEdgeGeometry(pageW, pageD, false),
    edgeMaterial,
    [pageX, -pageH / 2 - lift, 0],
    [Math.PI / 2, 0, 0],
  )

  if (book.binding === 'paperback') return

  const radius = 1.25
  const radialSegments = 12
  const cord = new THREE.CylinderGeometry(radius, radius, pageD, radialSegments, 1)
  // One texture tile used to cover 62% of the spine. Keep that thread pitch on the full length.
  const repeats = pageD / Math.max(4, pageD * 0.62)
  const uv = cord.attributes.uv
  const sideVerts = (radialSegments + 1) * 2
  for (let i = 0; i < sideVerts; i++) uv.setY(i, uv.getY(i) * repeats)
  cord.rotateX(Math.PI / 2)
  const x = pageX - pageW / 2 + 0.35
  const y = pageH / 2 + radius * 0.9
  addMesh(parent, cord, headbandMaterial, [x, y, 0])
  addMesh(parent, cord.clone(), headbandMaterial, [x, -y, 0])
}

export function buildBook(
  book: BookSpec,
  materials: {
    print: THREE.Material
    case: THREE.Material
    page: THREE.Material
    pageEdge: THREE.Material
    headband: THREE.Material
    hinge: THREE.Material
  },
) {
  const group = new THREE.Group()
  group.name = book.slug
  const uv = spreadUv(book)
  const hinge = book.binding === 'paper-over-board'

  if (book.binding === 'paperback') {
    addPages(group, book, materials.page, materials.pageEdge, materials.headband)
    addShell(group, book, uv, materials.print, 0, false, materials.hinge)
    return group
  }

  const offset = book.binding === 'jacket' ? 0.55 : 0.12
  const clearance = Math.max(0, HINGE_DEPTH + 0.3 - offset)
  addCase(group, book, materials.case, clearance)
  addPages(group, book, materials.page, materials.pageEdge, materials.headband)
  addShell(group, book, uv, materials.print, offset, hinge, materials.hinge)
  return group
}

export function disposeBook(group: THREE.Object3D) {
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) obj.geometry.dispose()
  })
}
