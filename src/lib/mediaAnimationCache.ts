const svgCache = new Map<string, string>()
const lottieCache = new Map<string, unknown>()
const inflightSvg = new Map<string, Promise<string>>()
const inflightLottie = new Map<string, Promise<unknown>>()

export function getCachedSvg(src: string): string | undefined {
  return svgCache.get(src)
}

export function getCachedLottieData(src: string): unknown | undefined {
  return lottieCache.get(src)
}

async function fetchSvg(src: string): Promise<string> {
  const response = await fetch(src)
  if (!response.ok) {
    throw new Error(`Failed to fetch SVG (${response.status}): ${src}`)
  }
  const text = await response.text()
  svgCache.set(src, text)
  return text
}

async function fetchLottieData(src: string): Promise<unknown> {
  const response = await fetch(src)
  if (!response.ok) {
    throw new Error(`Failed to fetch Lottie JSON (${response.status}): ${src}`)
  }
  const data: unknown = await response.json()
  lottieCache.set(src, data)
  return data
}

/** Returns cached SVG markup or fetches once and caches for reuse across remounts. */
export function loadSvg(src: string): Promise<string> {
  const cached = svgCache.get(src)
  if (cached) return Promise.resolve(cached)

  const pending = inflightSvg.get(src)
  if (pending) return pending

  const promise = fetchSvg(src).finally(() => {
    inflightSvg.delete(src)
  })
  inflightSvg.set(src, promise)
  return promise
}

/** Returns cached Lottie JSON or fetches once and caches for reuse across remounts. */
export function loadLottieData(src: string): Promise<unknown> {
  const cached = lottieCache.get(src)
  if (cached) return Promise.resolve(cached)

  const pending = inflightLottie.get(src)
  if (pending) return pending

  const promise = fetchLottieData(src).finally(() => {
    inflightLottie.delete(src)
  })
  inflightLottie.set(src, promise)
  return promise
}
