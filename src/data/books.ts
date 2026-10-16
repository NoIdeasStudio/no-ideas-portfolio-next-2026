export type Binding = 'paperback' | 'paper-over-board' | 'jacket'

/** Fractions of a flat spread image. They sum to 1. Flaps are 0 when the cover has none. */
export type SpreadUv = {
  leftBleed: number
  backFlap: number
  back: number
  /** Jacket paper between the back face and the spine. Not on the board. */
  backJoint: number
  spine: number
  /** Jacket paper between the spine and the front face. Not on the board. */
  frontJoint: number
  front: number
  frontFlap: number
  rightBleed: number
  bottomBleed: number
  topBleed: number
}

/** A rectangle on the front face, in fractions of that face. Origin is the bottom-left. */
export type FaceRect = {
  u: number
  v: number
  w: number
  h: number
}

export type BookSpec = {
  slug: string
  title: string
  binding: Binding
  /** Cover face, millimeters. */
  widthMm: number
  heightMm: number
  /** Outside spine thickness, millimeters. */
  spineMm: number
  pageCount: number
  /** Binder's board, or cover stock on a paperback. */
  boardMm: number
  /** Board overhang past the text block. Zero on a paperback. */
  squareMm: number
  caseColor: string
  coverColor: string
  /** Flat foil block drawn into a generated stand-in. */
  foil?: { color: string; rect: FaceRect }
  /** Spot-UV block drawn into a generated stand-in. */
  varnish?: { rect: FaceRect }
  maps?: {
    cover: string
    foil?: string
    varnish?: string
    /** White where the cover is recessed. */
    deboss?: string
  }
  /** Copy for the cover info panel. */
  description?: string
  /** Set when the spread comes from a mechanical. Otherwise derived from bleedMm. */
  uv?: SpreadUv
  bleedMm?: number
}

const IN = 25.4

/**
 * Bigger than Fashion is paper over board, from the R1 mechanical:
 * 0.125 in bleed, 6 in back, 1.125 in spine, 6 in front, 0.125 in bleed.
 * Height is 9 in plus 0.125 in bleed. Page 2 of that PDF is the spot UV plate.
 */
export const books: BookSpec[] = [
  {
    slug: 'bigger-than-fashion',
    title: 'Bigger than Fashion',
    binding: 'paper-over-board',
    widthMm: 6 * IN,
    heightMm: 9 * IN,
    spineMm: 1.125 * IN,
    pageCount: 352,
    boardMm: 2.5,
    squareMm: 3,
    caseColor: '#d9d3c6',
    coverColor: '#EA0028',
    description:
      'Bigger than Fashion by Tyler Watamanuk. AD Jackie Seow. Published by Simon and Schuster.',
    maps: {
      cover: '/books/bigger-than-fashion/cover.png?v=3',
      varnish: '/books/bigger-than-fashion/varnish.png?v=3',
    },
    uv: {
      leftBleed: 0.125 / 13.375,
      backFlap: 0,
      back: 6 / 13.375,
      backJoint: 0,
      spine: 1.125 / 13.375,
      frontJoint: 0,
      front: 6 / 13.375,
      frontFlap: 0,
      rightBleed: 0.125 / 13.375,
      bottomBleed: 0.125 / 9.25,
      topBleed: 0.125 / 9.25,
    },
  },
  {
    slug: 'insurrection',
    title: 'Insurrection',
    binding: 'jacket',
    widthMm: 6.0938 * IN,
    heightMm: 9.25 * IN,
    spineMm: 0.9375 * IN,
    pageCount: 256,
    boardMm: 2.5,
    squareMm: 3,
    caseColor: '#d9d3c6',
    coverColor: '#111111',
    description:
      'Insurrection by Hawa Allan. AD Yang Kim. Published by W.W. Norton.',
    maps: {
      cover: '/books/insurrection/cover.png?v=2',
    },
    // Trim is 20.625 in: 3.5 in flaps, 6.0938 in boards, 0.9375 in spine,
    // plus 0.125 in of jacket on either side of each board so the paper is centered.
    uv: {
      leftBleed: 0.125 / 20.875,
      backFlap: 3.625 / 20.875,
      back: 6.0938 / 20.875,
      backJoint: 0.125 / 20.875,
      spine: 0.9375 / 20.875,
      frontJoint: 0.125 / 20.875,
      front: 6.0938 / 20.875,
      frontFlap: 3.625 / 20.875,
      rightBleed: 0.125 / 20.875,
      bottomBleed: 0.125 / 9.5,
      topBleed: 0.125 / 9.5,
    },
  },
  {
    slug: 'unpaid',
    title: 'Unpaid',
    binding: 'paperback',
    widthMm: 5.508 * IN,
    heightMm: 8.268 * IN,
    spineMm: 0.7 * IN,
    pageCount: 208,
    boardMm: 0.35,
    squareMm: 0,
    caseColor: '#db4b30',
    coverColor: '#db4b30',
    description: 'Unpaid by Matthew Cole. AD Melissa Weiss. Published by Verso Books.',
    maps: {
      cover: '/books/unpaid/cover.png?v=3',
      deboss: '/books/unpaid/deboss.png?v=3',
    },
    uv: {
      leftBleed: 0.118 / 11.952,
      backFlap: 0,
      back: 5.508 / 11.952,
      backJoint: 0,
      spine: 0.7 / 11.952,
      frontJoint: 0,
      front: 5.508 / 11.952,
      frontFlap: 0,
      rightBleed: 0.118 / 11.952,
      bottomBleed: 0.118 / 8.504,
      topBleed: 0.118 / 8.504,
    },
  },
  {
    slug: 'thin-paperback',
    title: 'Thin Paperback',
    binding: 'paperback',
    widthMm: 5 * IN,
    heightMm: 7.5 * IN,
    spineMm: 96 * 0.09,
    pageCount: 96,
    boardMm: 0.35,
    squareMm: 0,
    caseColor: '#16324a',
    coverColor: '#16324a',
    foil: {
      color: '#e4c16a',
      rect: { u: 0.1, v: 0.58, w: 0.8, h: 0.24 },
    },
    bleedMm: 1.5,
  },
  {
    slug: 'square-boards',
    title: 'Square Boards',
    binding: 'paper-over-board',
    widthMm: 7.5 * IN,
    heightMm: 7.5 * IN,
    spineMm: 180 * 0.1 + 5,
    pageCount: 180,
    boardMm: 2.5,
    squareMm: 3,
    caseColor: '#c4b49a',
    coverColor: '#9c4a32',
    varnish: {
      rect: { u: 0.16, v: 0.22, w: 0.68, h: 0.46 },
    },
    bleedMm: 1.5,
  },
]

export function spreadUv(book: BookSpec): SpreadUv {
  if (book.uv) return book.uv
  const bleed = book.bleedMm ?? 0
  const totalW = bleed + book.widthMm + book.spineMm + book.widthMm + bleed
  const totalH = bleed + book.heightMm + bleed
  return {
    leftBleed: bleed / totalW,
    backFlap: 0,
    back: book.widthMm / totalW,
    backJoint: 0,
    spine: book.spineMm / totalW,
    frontJoint: 0,
    front: book.widthMm / totalW,
    frontFlap: 0,
    rightBleed: bleed / totalW,
    bottomBleed: bleed / totalH,
    topBleed: bleed / totalH,
  }
}

/** Physical bleed in millimeters, for wrapping the cover edge. */
export function bleedMm(book: BookSpec): number {
  if (book.bleedMm != null) return book.bleedMm
  if (!book.uv) return 0
  const totalW = book.widthMm / book.uv.back
  return book.uv.leftBleed * totalW
}
