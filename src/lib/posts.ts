import { PrismaClient } from '@prisma/client';
import type { BlogPost, CreatePostRequest, UpdatePostRequest } from '../types/blog';
import slugify from 'slugify';

const prisma = new PrismaClient();

export const generateSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true
  });
};

export async function getAllPosts(): Promise<BlogPost[]> {
  return await prisma.post.findMany({
    where: {
      status: 'published'
    },
    orderBy: {
      publishedAt: 'desc'
    }
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return await prisma.post.findUnique({
    where: {
      slug
    }
  });
}

export async function createPost(data: CreatePostRequest): Promise<BlogPost> {
  const slug = generateSlug(data.title);
  
  return await prisma.post.create({
    data: {
      ...data,
      slug,
      status: 'draft',
      authorId: 'system' // TODO: Replace with actual author ID from auth
    }
  });
}

export async function updatePost(id: string, data: UpdatePostRequest): Promise<BlogPost> {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    throw new Error('Post not found');
  }

  return await prisma.post.update({
    where: { id },
    data: {
      ...data,
      slug: data.title ? generateSlug(data.title) : undefined,
      updatedAt: new Date()
    }
  });
}

export async function deletePost(id: string): Promise<void> {
  await prisma.post.delete({
    where: { id }
  });
}
