import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'token=; Path=/; HttpOnly; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    }
  );
};
