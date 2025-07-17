import sql from './db';
import type { BlogPost, CreatePostRequest, UpdatePostRequest } from '../types/blog';
import slugify from 'slugify';
import { nanoid } from 'nanoid';

export const generateSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true
  });
};

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
  const slug = generateSlug(data.title);
  const id = nanoid();
  const now = new Date();

  const [post] = await sql<BlogPost[]>`
    INSERT INTO posts (id, title, slug, content, excerpt, coverImage, tags, status, authorId, createdAt, updatedAt)
    VALUES (
      ${id},
      ${data.title},
      ${slug},
      ${data.content},
      ${data.excerpt || ''},
      ${data.coverImage || null},
      ${data.tags?.length ? data.tags : null},
      'draft',
      'system', -- TODO: Replace with actual author ID from auth
      ${now},
      ${now}
    )
    RETURNING *
  `;
  return post;
}

export async function updatePost(slug: string, data: UpdatePostRequest): Promise<BlogPost> {
  const post = await getPostBySlug(slug);
  if (!post) throw new Error('Post not found');

  const newSlug = data.title ? generateSlug(data.title) : post.slug;
  const updatedAt = new Date();
  const excerpt = (data.excerpt ?? post.excerpt) || '';
  const coverImage = (data.coverImage ?? post.coverImage) || '';

  const [updated] = await sql<BlogPost[]>`
    UPDATE posts
    SET
      title = ${data.title ?? post.title},
      slug = ${newSlug},
      excerpt = ${excerpt},
      coverImage = ${coverImage},
      content = ${data.content ?? post.content},
      tags = ${data.tags ? JSON.stringify(data.tags) : JSON.stringify(post.tags)},
      status = ${data.status ?? post.status},
      updatedAt = ${updatedAt}
    WHERE slug = ${slug}
    RETURNING *
  `;
  return updated;
}

export async function deletePost(slug: string): Promise<void> {
  await sql`
    DELETE FROM posts WHERE slug = ${slug}
  `;
}
