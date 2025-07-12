import type { APIRoute } from 'astro';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface LoginRequest {
  username: string;
  password: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { username, password } = await request.json() as LoginRequest;

    // TODO: Replace with actual user validation
    if (username !== 'admin' || password !== 'admin') {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Invalid credentials' }
        }),
        { status: 401 }
      );
    }

    const token = sign({ username }, JWT_SECRET, { expiresIn: '1d' });

    return new Response(
      JSON.stringify({
        success: true,
        data: { token }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Strict`
        }
      }
    );
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
