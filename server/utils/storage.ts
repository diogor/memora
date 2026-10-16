import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'

type StoredObject = {
  data: Uint8Array
  contentType: string
}

let _s3: S3Client | undefined

function localDir(): string {
  return resolve(process.cwd(), useRuntimeConfig().storageLocalDir || '.data/uploads')
}

function useR2(): boolean {
  return (useRuntimeConfig().storageDriver || 'local') === 'r2'
}

function s3(): S3Client {
  if (!_s3) {
    const r2 = useRuntimeConfig().r2
    _s3 = new S3Client({
      region: 'auto',
      endpoint: r2.endpoint || `https://${r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2.accessKeyId,
        secretAccessKey: r2.secretAccessKey,
      },
    })
  }
  return _s3
}

/** Salva um objeto binário. Retorna a chave usada. */
export async function putObject(
  key: string,
  data: Uint8Array,
  contentType: string,
): Promise<void> {
  if (useR2()) {
    await s3().send(
      new PutObjectCommand({
        Bucket: useRuntimeConfig().r2.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      }),
    )
    return
  }
  const path = resolve(localDir(), key)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, data)
}

/** Lê um objeto binário. */
export async function getObject(key: string, fallbackType = 'application/octet-stream'): Promise<StoredObject> {
  if (useR2()) {
    const res = await s3().send(
      new GetObjectCommand({ Bucket: useRuntimeConfig().r2.bucket, Key: key }),
    )
    const bytes = await res.Body!.transformToByteArray()
    return { data: bytes, contentType: res.ContentType || fallbackType }
  }
  const data = await readFile(resolve(localDir(), key))
  return { data, contentType: fallbackType }
}

/** Remove um objeto binário (ignora ausência). */
export async function deleteObject(key: string): Promise<void> {
  try {
    if (useR2()) {
      await s3().send(
        new DeleteObjectCommand({ Bucket: useRuntimeConfig().r2.bucket, Key: key }),
      )
      return
    }
    await unlink(resolve(localDir(), key))
  } catch {
    // objeto já inexistente — nada a fazer
  }
}
