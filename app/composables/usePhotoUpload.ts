export interface PhotoMeta {
  width: number
  height: number
  previewDataUrl: string | null
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Falha ao ler a imagem'))
    img.src = src
  })
}

/**
 * Lê dimensões e gera uma miniatura desfocada (data URL) que serve de
 * placeholder atrás do texto, antes de revelar a foto original.
 */
export async function buildPhotoMeta(file: File): Promise<PhotoMeta> {
  if (!import.meta.client) return { width: 0, height: 0, previewDataUrl: null }

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)
    const width = img.naturalWidth
    const height = img.naturalHeight

    const scale = Math.min(1, 28 / Math.max(width, height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))

    const ctx = canvas.getContext('2d')
    let previewDataUrl: string | null = null
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      previewDataUrl = canvas.toDataURL('image/jpeg', 0.5)
    }
    return { width, height, previewDataUrl }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

/** Envia a foto e retorna o id do registro criado. */
export async function uploadPhoto(
  file: File,
  meta: PhotoMeta,
): Promise<{ id: string; previewDataUrl: string | null }> {
  const form = new FormData()
  form.append('file', file)
  form.append('width', String(meta.width))
  form.append('height', String(meta.height))
  if (meta.previewDataUrl) form.append('previewDataUrl', meta.previewDataUrl)

  return await $fetch<{ id: string; previewDataUrl: string | null }>('/api/photos', {
    method: 'POST',
    // `as any` evita a explosão de profundidade do `$fetch` tipado com FormData.
    body: form as any,
  })
}
