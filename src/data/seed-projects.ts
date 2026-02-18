/**
 * Seed projects/slides scraped from no-ideas.webflow.io.
 * Used when Sanity has no projects yet so the site shows content immediately.
 */

export type SeedSlide = {
  layout: 'fullBleed' | 'contain'
  mediaType: 'image' | 'video'
  imageUrl?: string
  videoUrl?: string
  caption?: string
}

export type SeedProject = {
  _id: string
  title: string
  slug: string
  slides: SeedSlide[]
}

const CDN = 'https://cdn.prod.website-files.com/6570d6395abf1c6e896cc7f6'
const VIDEO = 'https://no-ideas-portfolio.nyc3.cdn.digitaloceanspaces.com'

export const seedProjects: SeedProject[] = [
  {
    _id: 'seed-dumbo',
    title: 'DUMBO Open Studios 2025',
    slug: 'dumbo-open-studios-2025',
    slides: [
      { layout: 'fullBleed', mediaType: 'video', videoUrl: `${VIDEO}/no-ideas-identity-design-dumbo-open-studios-2.mp4` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/68701e85efac4b2ec06a91fa_dos-2025-1.avif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/68701ea9dda4f59f6b2b1265_dos-2025-2png.avif` },
    ],
  },
  {
    _id: 'seed-parsons',
    title: 'Parsons Design Lecture Series',
    slug: 'parsons-design-lecture-series',
    slides: [
      { layout: 'fullBleed', mediaType: 'video', videoUrl: `${VIDEO}/parsons-in%20situ.mp4` },
      { layout: 'contain', mediaType: 'video', videoUrl: `${VIDEO}/01-Isabel%20Urbina%20Pena-Instagram.m4v` },
      { layout: 'contain', mediaType: 'video', videoUrl: `${VIDEO}/02-Carly%20Ayres-Instagram.m4v` },
      { layout: 'contain', mediaType: 'video', videoUrl: `${VIDEO}/03-Jon%20Sueda-Instagram.m4v` },
    ],
  },
  {
    _id: 'seed-verso',
    title: 'Verso Books',
    slug: 'verso-books',
    slides: [
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/6855910fcd29493737964c7c_verso-stack-close.avif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/685430a53f8bcbd63d78c0bf_verso-spine-2.avif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/6852ee7ec61321ebe3f4fe7f_verso-2.avif` },
      { layout: 'contain', mediaType: 'image', imageUrl: `${CDN}/685430a52494ff04c1531262_verso-spine-1.avif` },
      { layout: 'contain', mediaType: 'image', imageUrl: `${CDN}/685430a5d1d14261ed97a30f_verso-ia.avif` },
    ],
  },
  {
    _id: 'seed-baffler',
    title: 'The Baffler',
    slug: 'the-baffler',
    slides: [
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/685324ff1ccd04cbad080643_baffler-covers.gif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/6852f4ca9fe0be3cb66c16c6_baffler-grid.avif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/6852f67dbb42854b6cd99505_baffler-1.avif` },
    ],
  },
  {
    _id: 'seed-art-in-dumbo',
    title: 'Art in DUMBO',
    slug: 'art-in-dumbo',
    slides: [
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/6848757946c1024e1ebeba70_art-in-dumbo-open-studips-banner-compressed.avif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/684876c25e08975e51fd4058_art-in-dumbo-open-studips-sandwich-board-compressed.avif` },
      { layout: 'contain', mediaType: 'image', imageUrl: `${CDN}/684877ba40940ab541023817_art-in-dumbo-open-studios-2024-maps-compressed.avif` },
    ],
  },
  {
    _id: 'seed-artadia',
    title: 'Artadia',
    slug: 'artadia',
    slides: [
      { layout: 'fullBleed', mediaType: 'video', videoUrl: `${VIDEO}/artadia-grid.mp4` },
      { layout: 'fullBleed', mediaType: 'video', videoUrl: `${VIDEO}/Artadia-trim-2.mp4` },
      { layout: 'fullBleed', mediaType: 'video', videoUrl: `${VIDEO}/artadia-artist-page.mp4` },
    ],
  },
  {
    _id: 'seed-lou-reed',
    title: 'Lou Reed: King of New York',
    slug: 'lou-reed-king-of-new-york',
    slides: [
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/6848662d9f1ee9d3669e61ed_lou-reed-front-open-compressed.avif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/6848662dc7022e8cd7660726_lou-reed-front-cover-compressed.avif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/68487d50365e5d40d3824ee7_lou-reed-front-covers-compressed.avif` },
      { layout: 'contain', mediaType: 'image', imageUrl: `${CDN}/6848662d956250b7dec70041_Lou-Reed-Back-Band%20compressed.avif` },
    ],
  },
  {
    _id: 'seed-sesamy',
    title: 'Sesamy Agency',
    slug: 'sesamy-agency',
    slides: [
      { layout: 'fullBleed', mediaType: 'video', videoUrl: `${VIDEO}/SESAMY-Services-Edit.mov_compressed.mp4` },
      { layout: 'fullBleed', mediaType: 'video', videoUrl: `${VIDEO}/02%20New%20Website%20Grid.mp4` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/684c3a1bdd242ec3b8c56fd7_sesamy-invitation-edit%20compressed.avif` },
    ],
  },
  {
    _id: 'seed-shot-ready',
    title: 'Shot Ready',
    slug: 'shot-ready',
    slides: [
      { layout: 'fullBleed', mediaType: 'video', videoUrl: `${VIDEO}/portfolio-scroll_compressed.mp4` },
      { layout: 'fullBleed', mediaType: 'video', videoUrl: `${VIDEO}/spin_compressed.mp4` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/6854482db52648bb4b668e6a_Page%2088.avif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/6854485110ee970e4c4999f2_Page%20102.avif` },
    ],
  },
  {
    _id: 'seed-baffler-store',
    title: 'The Baffler Store',
    slug: 'the-baffler-store',
    slides: [
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/67fac6c31746ed163321a9cf_no-ideas-merch-design-baffler-tote-1.avif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/67fac6d29382481782ebc10f_no-ideas-merch-design-baffler-tote-2.avif` },
      { layout: 'contain', mediaType: 'image', imageUrl: `${CDN}/68485653bfbd8b113e22c98b_Tee%20Artist%20Series%20Noah%20Baker%20Vertical%20(compressed).avif` },
      { layout: 'contain', mediaType: 'image', imageUrl: `${CDN}/684c7587dbc18bcb37b07c9d_Baffler%20Logo%20Hat%201%20(compressed).avif` },
    ],
  },
  {
    _id: 'seed-sackville',
    title: 'Sackville & Co.',
    slug: 'sackville-co',
    slides: [
      { layout: 'fullBleed', mediaType: 'video', videoUrl: `${VIDEO}/Sackville-V3-Recording-short.mp4` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/6854671bd8a25ca690c9c2f2_Sackville-mobile-vibes.gif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/68546796207784144a6fc000_sackville-aprilmartin.avif` },
      { layout: 'contain', mediaType: 'image', imageUrl: `${CDN}/68546850e605968293e7eb52_sackville-agegate.avif` },
    ],
  },
  {
    _id: 'seed-icancookvegan',
    title: "I Can Cook Vegan",
    slug: "i-can-cook-vegan",
    slides: [
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/6852ffe9f60c281ecae6d3cf_icancookvegan-1.avif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/68542e269dae104bc522660b_ICCV-Portfolio-GIF-2.avif` },
      { layout: 'fullBleed', mediaType: 'image', imageUrl: `${CDN}/6853002cc2aeeebe58853cb3_icancookvegan-close.avif` },
    ],
  },
]
