export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  publishedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
  authorId: string;
  status: 'draft' | 'published';
  tags?: string[];
}

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  status?: 'draft' | 'published';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
