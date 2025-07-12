import type { APIRoute } from 'astro';
import { getPostBySlug, updatePost, deletePost } from '../../../lib/posts';
import type { UpdatePostRequest } from '../../../types/blog';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Slug is required' }
        }),
        { status: 400 }
      );
    }

    const post = await getPostBySlug(slug);
    if (!post) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Post not found' }
        }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ success: true, data: post }), {
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
      { status: 500 }
    );
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Post ID is required' }
        }),
        { status: 400 }
      );
    }

    const body = await request.json();
    const post = await updatePost(id, body as UpdatePostRequest);

    return new Response(JSON.stringify({ success: true, data: post }), {
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
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Post ID is required' }
        }),
        { status: 400 }
      );
    }

    await deletePost(id);

    return new Response(JSON.stringify({ success: true }), {
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
      { status: 500 }
    );
  }
};
