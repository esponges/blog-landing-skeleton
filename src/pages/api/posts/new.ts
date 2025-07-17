import type { APIRoute } from 'astro';
import { createPost } from '../../../lib/posts';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const post = await createPost(body);

    return new Response(JSON.stringify({ success: true, data: post }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
        }
      }),
      { status: 500 }
    );
  }
};
