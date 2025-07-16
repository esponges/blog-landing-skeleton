import React, { useState } from 'react';
import CustomEditor from './Editor';
import type { BlogPost } from '../../types/blog';
import { htmlToSlate } from '@slate-serializers/html';
import type { Descendant } from 'slate';

export default function EditPostForm({ post, error, success, slug }: {
  post: BlogPost;
  error?: string;
  success?: string;
  slug?: string;
}) {
  const [content, setContent] = useState(htmlToSlate(post.content) as Descendant[]);

  return (
    <form method="post" className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Title</label>
        <input name="title" defaultValue={post.title} className="w-full border rounded px-3 py-2" required />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Excerpt</label>
        <input name="excerpt" defaultValue={post.excerpt || ''} className="w-full border rounded px-3 py-2" />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Content</label>
        <CustomEditor
          value={content}
          onChange={setContent}
          className="border rounded px-3 py-2 min-h-[200px]"
        />
        <input type="hidden" name="content" value={JSON.stringify(content)} />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Cover Image URL</label>
        <input name="coverImage" defaultValue={post.coverImage || ''} className="w-full border rounded px-3 py-2" />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Tags (comma separated)</label>
        <input name="tags" defaultValue={post.tags?.join(', ') || ''} className="w-full border rounded px-3 py-2" />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Status</label>
        <select name="status" className="w-full border rounded px-3 py-2" defaultValue={post.status}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600">Save</button>
        <button type="button" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => {
          if (confirm('Delete this post?')) {
            alert('Post deleted'); // Replace with actual delete logic
            // fetch(`/api/posts/${slug}`, { method: 'DELETE' }).then(() => window.location = '/admin/posts');
          }
        }}>Delete</button>
      </div>
    </form>
  );
}
