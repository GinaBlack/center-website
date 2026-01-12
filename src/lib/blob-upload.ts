import { put } from '@vercel/blob';

export async function uploadToBlob(file: File): Promise<{
  url: string;
  downloadUrl?: string;
  pathname: string;
  contentType?: string;
  contentDisposition: string;
}> {
  try {
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
    });

    return blob;
  } catch (error) {
    console.error('Blob upload error:', error);
    throw new Error('Failed to upload file');
  }
}

export async function uploadMultipleFiles(files: File[]): Promise<
  Array<{
    url: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
  }>
> {
  const uploadPromises = files.map(async (file) => {
    const blob = await uploadToBlob(file);
    return {
      url: blob.url,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };
  });

  return Promise.all(uploadPromises);
}