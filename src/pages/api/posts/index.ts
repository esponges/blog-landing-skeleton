import type { APIRoute } from 'astro';
import { getAllPosts, createPost } from '../../../lib/posts';
import type { CreatePostRequest } from '../../../types/blog';

export const GET: APIRoute = async () => {
  try {
    const posts = await getAllPosts();
    return new Response(JSON.stringify({ success: true, data: posts }), {
      status: 200,
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
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const post = await createPost(body as CreatePostRequest);
    
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
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
