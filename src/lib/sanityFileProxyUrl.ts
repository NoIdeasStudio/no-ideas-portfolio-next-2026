const SANITY_FILES_CDN = 'https://cdn.sanity.io/files/'

/** Same-origin path for Sanity file CDN URLs so client fetch avoids CORS blocks. */
export function sanityFileFetchUrl(url: string): string {
  if (!url.startsWith(SANITY_FILES_CDN)) return url
  return `/sanity-files/${url.slice(SANITY_FILES_CDN.length)}`
}
