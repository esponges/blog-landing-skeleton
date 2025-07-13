import sql from '../../../lib/db';
import { nanoid } from 'nanoid';
import type { BlogPost, CreatePostRequest } from '../../../types/blog';

export async function getAllPosts(): Promise<BlogPost[]> {
  return await sql<BlogPost[]>`
    SELECT * FROM posts ORDER BY publishedAt DESC NULLS LAST, createdAt DESC
  `;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const result = await sql<BlogPost[]>`
    SELECT * FROM posts WHERE slug = ${slug} LIMIT 1
  `;
  return result[0] || null;
}

export async function createPost(data: CreatePostRequest): Promise<BlogPost> {
  const id = nanoid();
  const now = new Date();
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const [post] = await sql<BlogPost[]>`
    INSERT INTO posts (id, title, slug, content, excerpt, coverImage, tags, status, createdAt, updatedAt)
    VALUES (
      ${id},
      ${data.title},
      ${slug},
      ${data.content},
      ${data.excerpt || ''},
      ${data.coverImage || null},
      ${JSON.stringify(data.tags || [])},
      'draft',
      ${now},
      ${now}
    )
    RETURNING *
  `;
  return post;
}

// Add updatePost and deletePost similarly...
