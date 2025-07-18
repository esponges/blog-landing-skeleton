import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { APIContext, APIRoute } from 'astro';

const s3 = new S3Client({
  region: process.env.R2_REGION,
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export const POST: APIRoute = async ({ request }: APIContext) => {
  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) {
    return new Response(JSON.stringify({ success: false, error: { message: 'No file uploaded' } }), { status: 400 });
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const bucket = process.env.R2_BUCKET!;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      ACL: 'public-read',
    }));
    const url = `${process.env.R2_PUBLIC_URL}/${filename}`;
    return new Response(JSON.stringify({ success: true, url }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: { message: String(error) } }), { status: 500 });
  }
};
