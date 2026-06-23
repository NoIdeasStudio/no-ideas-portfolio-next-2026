/** Match mobile user agents — same check used for auto-scroll and loop duplicate. */
export function isMobileUserAgent(): boolean {
  return typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)
}
