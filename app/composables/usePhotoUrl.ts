/** Monta a URL autenticada (ou via token) de uma imagem de foto. */
export function usePhotoUrl(photoId?: string | null, token?: string | null): string | null {
  if (!photoId) return null
  const base = `/api/photos/${photoId}/image`
  return token ? `${base}?token=${encodeURIComponent(token)}` : base
}
