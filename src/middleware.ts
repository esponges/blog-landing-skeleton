import jwt from 'jsonwebtoken';
import type { MiddlewareHandler, APIContext } from 'astro';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const onRequest: MiddlewareHandler = async (context: APIContext, next) => {
  const { request, locals } = context;
  // Skip auth for non-admin routes
  if (!request.url.includes('/api/admin/')) {
    return next();
  }

  const token = request.headers.get('Authorization')?.split(' ')[1] ||
    request.headers.get('Cookie')?.split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];

  if (!token) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Authentication required' }
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    locals.user = decoded;
    return next();
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Invalid or expired token' }
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
