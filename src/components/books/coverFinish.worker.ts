/// <reference lib="webworker" />

const VARNISH_RADIUS = 5

type FinishRequest =
  | { id: number; kind: 'varnish'; cover: ImageBitmap; varnish: ImageBitmap }
  | { id: number; kind: 'roughness'; foil: ImageBitmap }

function roughnessBitmap(foil: ImageBitmap) {
  const canvas = new OffscreenCanvas(foil.width, foil.height)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Could not read a foil plate')
  context.drawImage(foil, 0, 0)
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
  const { data, width, height } = pixels
  for (let y = 0; y < height; y++) {
    const row = y * width * 4
    for (let x = 0; x < width; x++) {
      const i = row + x * 4
      const foilAmount = data[i] / 255
      const rough = Math.round((1 - foilAmount * 0.82) * 255)
      data[i] = rough
      data[i + 1] = rough
      data[i + 2] = rough
      data[i + 3] = 255
    }
  }
  context.putImageData(pixels, 0, 0)
  return canvas.transferToImageBitmap()
}

function varnishBitmaps(cover: ImageBitmap, varnish: ImageBitmap) {
  const width = cover.width
  const height = cover.height
  const coverCanvas = new OffscreenCanvas(width, height)
  const maskCanvas = new OffscreenCanvas(width, height)
  const coverContext = coverCanvas.getContext('2d', { willReadFrequently: true })
  const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true })
  if (!coverContext || !maskContext) throw new Error('Could not read a varnish plate')
  coverContext.drawImage(cover, 0, 0, width, height)
  maskContext.drawImage(varnish, 0, 0, width, height)
  const coverPixels = coverContext.getImageData(0, 0, width, height)
  const mask = maskContext.getImageData(0, 0, width, height).data
  const roughData = new Uint8ClampedArray(coverPixels.data.length)
  const normalData = new Uint8ClampedArray(coverPixels.data.length)
  const coatedAt = (x: number, y: number) => {
    const cx = Math.max(0, Math.min(width - 1, x))
    const cy = Math.max(0, Math.min(height - 1, y))
    return mask[(cy * width + cx) * 4] / 255
  }
  for (let y = 0; y < height; y++) {
    const row = y * width * 4
    for (let x = 0; x < width; x++) {
      const i = row + x * 4
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
      const dx = coatedAt(x + VARNISH_RADIUS, y) - coatedAt(x - VARNISH_RADIUS, y)
      const dy = coatedAt(x, y + VARNISH_RADIUS) - coatedAt(x, y - VARNISH_RADIUS)
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
  const roughCanvas = new OffscreenCanvas(width, height)
  const normalCanvas = new OffscreenCanvas(width, height)
  const roughContext = roughCanvas.getContext('2d')
  const normalContext = normalCanvas.getContext('2d')
  if (!roughContext || !normalContext) throw new Error('Could not draw a varnish plate')
  roughContext.putImageData(new ImageData(roughData, width, height), 0, 0)
  normalContext.putImageData(new ImageData(normalData, width, height), 0, 0)
  return {
    cover: coverCanvas.transferToImageBitmap(),
    rough: roughCanvas.transferToImageBitmap(),
    normal: normalCanvas.transferToImageBitmap(),
  }
}

self.onmessage = (event: MessageEvent<FinishRequest>) => {
  const message = event.data
  if (message.kind === 'roughness') {
    const rough = roughnessBitmap(message.foil)
    message.foil.close()
    self.postMessage({ id: message.id, kind: 'roughness', rough }, [rough])
    return
  }
  const plates = varnishBitmaps(message.cover, message.varnish)
  message.cover.close()
  message.varnish.close()
  self.postMessage({ id: message.id, kind: 'varnish', ...plates }, [plates.cover, plates.rough, plates.normal])
}
