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
    slug: 'enshittification',
    title: 'Enshittification',
    binding: 'jacket',
    widthMm: 5.5 * IN,
    heightMm: 8.4375 * IN,
    spineMm: 1.125 * IN,
    pageCount: 352,
    boardMm: 2.5,
    squareMm: 3,
    caseColor: '#d9d3c6',
    coverColor: '#111111',
    description:
      'Enshittification by Cory Doctorow. Design by No Ideas. Published by MCD.',
    maps: {
      cover: '/books/enshittification/cover.png?v=3',
      varnish: '/books/enshittification/varnish.png?v=1',
    },
    // Jacket mechanical: 0.125 in bleed, 3.5 in flaps, 0.375 in of jacket
    // past each fore-edge, 5.5 in boards, 1.125 in spine. The 0.375 in rides
    // with the flap so it wraps the board edge. Page 2 is the spot-gloss plate.
    uv: {
      leftBleed: 0.125 / 20.125,
      backFlap: 3.875 / 20.125,
      back: 5.5 / 20.125,
      backJoint: 0,
      spine: 1.125 / 20.125,
      frontJoint: 0,
      front: 5.5 / 20.125,
      frontFlap: 3.875 / 20.125,
      rightBleed: 0.125 / 20.125,
      bottomBleed: 0.125 / 8.6875,
      topBleed: 0.125 / 8.6875,
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
    slug: 'overtime',
    title: 'Overtime',
    binding: 'paperback',
    widthMm: 111,
    heightMm: 178,
    spineMm: 10.6,
    pageCount: 144,
    boardMm: 0.35,
    squareMm: 0,
    caseColor: '#ffffff',
    coverColor: '#d8232a',
    description:
      'Overtime by Kyle Lewis and Will Stronge. Design by No Ideas. Published by Verso Books.',
    maps: {
      cover: '/books/overtime/cover.png?v=1',
    },
    // Mechanical: 111 × 178, spine 10.6, flaps 75. Bleed is 3 mm.
    uv: {
      leftBleed: 3 / 388.6,
      backFlap: 75 / 388.6,
      back: 111 / 388.6,
      backJoint: 0,
      spine: 10.6 / 388.6,
      frontJoint: 0,
      front: 111 / 388.6,
      frontFlap: 75 / 388.6,
      rightBleed: 3 / 388.6,
      bottomBleed: 3 / 184,
      topBleed: 3 / 184,
    },
  },
  {
    slug: 'females',
    title: 'Females',
    binding: 'paperback',
    widthMm: 111,
    heightMm: 178,
    spineMm: 8.8992,
    pageCount: 112,
    boardMm: 0.35,
    squareMm: 0,
    caseColor: '#ffffff',
    coverColor: '#e15b4a',
    description:
      'Females by Andrea Long Chu. Design by No Ideas. Published by Verso Books.',
    maps: {
      cover: '/books/females/cover.png?v=1',
    },
    // Same 111 × 178 face and 75 mm flaps. Spine is the trim remainder, 8.9 mm.
    // Bleed is 0.125 in.
    uv: {
      leftBleed: 3.1694 / 387.2395,
      backFlap: 75 / 387.2395,
      back: 111 / 387.2395,
      backJoint: 0,
      spine: 8.8992 / 387.2395,
      frontJoint: 0,
      front: 111 / 387.2395,
      frontFlap: 75 / 387.2395,
      rightBleed: 3.1709 / 387.2395,
      bottomBleed: 3.175 / 184.35,
      topBleed: 3.175 / 184.35,
    },
  },
  {
    slug: 'the-old-is-dying',
    title: 'The Old is Dying',
    binding: 'paperback',
    widthMm: 111,
    heightMm: 178,
    spineMm: 5.5,
    pageCount: 64,
    boardMm: 0.35,
    squareMm: 0,
    caseColor: '#061188',
    coverColor: '#e41128',
    description:
      'The Old Is Dying and the New Cannot Be Born by Nancy Fraser. Design by No Ideas. Published by Verso Books.',
    maps: {
      cover: '/books/the-old-is-dying/cover.png?v=2',
    },
    // Same 111 × 178 face, no flaps. Spine is the trim remainder, 5.5 mm. Bleed is 3 mm.
    uv: {
      leftBleed: 3 / 233.5,
      backFlap: 0,
      back: 111 / 233.5,
      backJoint: 0,
      spine: 5.5 / 233.5,
      frontJoint: 0,
      front: 111 / 233.5,
      frontFlap: 0,
      rightBleed: 3 / 233.5,
      bottomBleed: 3 / 184,
      topBleed: 3 / 184,
    },
  },
  {
    slug: 'green-new-deal',
    title: 'The Case for the Green New Deal',
    binding: 'paper-over-board',
    widthMm: 128.08,
    heightMm: 203.14,
    spineMm: 17,
    pageCount: 208,
    boardMm: 2.5,
    squareMm: 3,
    caseColor: '#d9d3c6',
    coverColor: '#3DD52F',
    description:
      'The Case for the Green New Deal by Ann Pettifor. Design by No Ideas. Published by Verso Books.',
    maps: {
      cover: '/books/green-new-deal/cover.png?v=2',
    },
    // R04 mechanical is 140 × 234 mm boards with 8 mm joints and a 17 mm spine.
    // The printed book crops that outer white: 16.8 mm off each fore-edge, 15.3 mm
    // off the head and tail, and 4.9 mm of each joint stays on the board.
    // Face is 128.08 × 203.14 mm. Pantone 802 C on white.
    uv: {
      leftBleed: 19.78 / 319,
      backFlap: 0,
      back: 128.08 / 319,
      backJoint: 3.14 / 319,
      spine: 17 / 319,
      frontJoint: 3.14 / 319,
      front: 128.08 / 319,
      frontFlap: 0,
      rightBleed: 19.78 / 319,
      bottomBleed: 18.6 / 240,
      topBleed: 18.26 / 240,
    },
  },
  {
    slug: 'comrade',
    title: 'Comrade',
    binding: 'paper-over-board',
    widthMm: 130,
    heightMm: 223,
    spineMm: 15,
    pageCount: 176,
    boardMm: 2.5,
    squareMm: 3,
    caseColor: '#d9d3c6',
    coverColor: '#FF3C1F',
    description:
      'Comrade by Jodi Dean. Design by Porto Rocha and No Ideas. Published by Verso Books.',
    maps: {
      cover: '/books/comrade/cover.png?v=1',
      varnish: '/books/comrade/varnish.png?v=1',
    },
    // PLC trim is 321 × 252 mm: 145 mm panels, 8 mm joints, 15 mm spine, 3 mm bleed.
    // The case turns 15 mm of each fore-edge inside. The tail turn-in is the
    // 29 mm of white under the type, so the face is 130 × 223 mm.
    uv: {
      leftBleed: 18 / 327,
      backFlap: 0,
      back: 130 / 327,
      backJoint: 8 / 327,
      spine: 15 / 327,
      frontJoint: 8 / 327,
      front: 130 / 327,
      frontFlap: 0,
      rightBleed: 18 / 327,
      bottomBleed: 32 / 258,
      topBleed: 3 / 258,
    },
  },
  {
    slug: 'investigative-aesthetics',
    title: 'Investigative Aesthetics',
    binding: 'paperback',
    widthMm: 140,
    heightMm: 210,
    spineMm: 16.9,
    pageCount: 272,
    boardMm: 0.35,
    squareMm: 0,
    caseColor: '#ffffff',
    coverColor: '#c8c8c8',
    description:
      'Investigative Aesthetics by Matthew Fuller and Eyal Weizman. Design by No Ideas. Published by Verso Books.',
    maps: {
      cover: '/books/investigative-aesthetics/cover.png?v=1',
      foil: '/books/investigative-aesthetics/foil.png?v=1',
    },
    // R3 mechanical. Trim is 140 × 210, spine 16.9, flaps 90. A 1 mm turn
    // sits between each flap and the cover face, and rides with the flap.
    // Bleed is 3 mm. Pantone 877 C is the silver foil.
    uv: {
      leftBleed: 3 / 484.9,
      backFlap: 91 / 484.9,
      back: 140 / 484.9,
      backJoint: 0,
      spine: 16.9 / 484.9,
      frontJoint: 0,
      front: 140 / 484.9,
      frontFlap: 91 / 484.9,
      rightBleed: 3 / 484.9,
      bottomBleed: 3 / 216,
      topBleed: 3 / 216,
    },
  },
  {
    slug: 'capital-is-dead',
    title: 'Capital Is Dead',
    binding: 'jacket',
    widthMm: 143,
    heightMm: 216,
    spineMm: 17,
    pageCount: 208,
    boardMm: 2.5,
    squareMm: 3,
    caseColor: '#f4f4f2',
    coverColor: '#f7f7f5',
    description:
      'Capital Is Dead by McKenzie Wark. Design by No Ideas. Published by Verso Books.',
    maps: {
      cover: '/books/capital-is-dead/cover.png?v=1',
      varnish: '/books/capital-is-dead/varnish.png?v=1',
    },
    // R04 jacket. The mechanical is marked 143 × 216, spine 17, flaps 88.9.
    // 10 mm of jacket past each fore-edge rides with the flap and wraps the board.
    // Bleed is 0.125 in. The spot-gloss plate is the type pills.
    uv: {
      leftBleed: 3.175 / 507.15,
      backFlap: 98.9 / 507.15,
      back: 143 / 507.15,
      backJoint: 0,
      spine: 17 / 507.15,
      frontJoint: 0,
      front: 143 / 507.15,
      frontFlap: 98.9 / 507.15,
      rightBleed: 3.175 / 507.15,
      bottomBleed: 3.175 / 222.35,
      topBleed: 3.175 / 222.35,
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
