import { createClient } from '@supabase/supabase-js'

function getClient() {
  const supabaseUrl = process.env.SUPABASE_API_URL?.toString() ?? ''
  const supabaseKey = process.env.SUPABASE_KEY?.toString() ?? ''
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

async function getOrCreateSupabaseBucket(id: string, is_public: boolean) {
  const client = getClient()

  const existingBucket = await client.storage.getBucket(id)
  if (existingBucket.data) {
    return {
      data: existingBucket.data,
      error: existingBucket.error,
    }
  }
  const newBucketId = await client.storage.createBucket(id, {
    public: is_public,
  })
  if (newBucketId.data) {
    const newBucket = await client.storage.getBucket(newBucketId.data.name)
    if (newBucket.data) {
      return {
        data: newBucket.data,
        error: newBucket.error,
      }
    }
  }
  return {
    data: null,
    error: newBucketId.error,
  }
}

async function createSupabaseFile(
  bucketId: string,
  path: string,
  file:
    | File
    | ReadableStream<Uint8Array>
    | ArrayBuffer
    | ArrayBufferView
    | Blob
    | Buffer
    | FormData
    | NodeJS.ReadableStream
    | ReadableStream<Uint8Array>
    | URLSearchParams
    | string,
  contentType?: string,
): Promise<{
  id: string
  publicUrl: string | null
}> {
  const client = getClient()
  const bucket = await getOrCreateSupabaseBucket(bucketId, true)
  if (!bucket.data) {
    if (bucket.error) {
      throw Error('Could not create supabase bucket: ' + bucket.error.message)
    } else {
      throw Error('Could not create supabase bucket: Unknown error')
    }
  }

  const createdSupabaseFile = await client.storage.from(bucket.data.id).upload(path, file, {
    contentType,
    duplex: 'half',
  })
  if (!createdSupabaseFile.data) {
    if (createdSupabaseFile.error) {
      throw Error(
        'Could not create supabase file: ' +
          JSON.stringify({ error: createdSupabaseFile.error.message, path }),
      )
    } else {
      throw Error('Could not create supabase file: Unknown error')
    }
  }

  return {
    id: createdSupabaseFile.data.path,
    publicUrl: await getSupabaseFilePublicUrl(bucketId, path),
  }
}

async function getSupabaseFilePublicUrl(bucketId: string, path: string): Promise<string | null> {
  const client = getClient()

  const supabaseFile = client.storage.from(bucketId).getPublicUrl(path)
  if (!supabaseFile.data.publicUrl) {
    throw Error('Could not get supabase file: Unknown error')
  }
  return supabaseFile.data.publicUrl
}

export async function storeSupabaseFile({
  bucket,
  content,
  id,
  replace,
}: {
  bucket: string
  content: string
  id: string
  replace?: boolean
}) {
  if (!process.env.SUPABASE_API_URL || !process.env.SUPABASE_KEY) {
    // eslint-disable-next-line no-console
    console.log('No supabase credentials, skipping file upload')
    return content
  }
  const client = getClient()
  if (content.startsWith('http') && !replace) {
    return content
  }
  if (!process.env.SUPABASE_API_URL || !process.env.SUPABASE_KEY) {
    return content
  }
  try {
    const blob = await (await fetch(content)).blob()
    const file = new File([blob], id)

    const existingFile = client.storage.from(bucket).getPublicUrl(id)
    if (existingFile) {
      const updatedSupabaseFile = await client.storage.from(bucket).update(id, file)
      const publicUrl = await getSupabaseFilePublicUrl(bucket, id)
      if (updatedSupabaseFile.data?.path && publicUrl) {
        return publicUrl
      }
    }
    const createdFile = await createSupabaseFile(bucket, id, file)
    if (createdFile.publicUrl) {
      return createdFile.publicUrl
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Could not create supabase file: ' + e)
  }
  return content
}
