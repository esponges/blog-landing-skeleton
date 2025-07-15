import React from 'react';
import type { BlogPost } from '../../types/blog';

interface PostsTableProps {
  posts: BlogPost[];
  editBaseUrl: string;
}

export default function PostsTable({ posts, editBaseUrl }: PostsTableProps) {
  console.log('Rendering PostsTable with posts:', posts, editBaseUrl);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Author</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id} className="border-t">
              <td className="px-4 py-2 font-medium">{post.title}</td>
              <td className="px-4 py-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-2">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '-'}</td>
              <td className="px-4 py-2">{post.authorId}</td>
              <td className="px-4 py-2 flex gap-2">
                <button className="text-blue-600 hover:underline" onClick={() => window.location.href = `${editBaseUrl}${post.slug}`}>Edit</button>
                <button className="text-red-600 hover:underline" onClick={() => alert(`Delete ${post.slug}`)}>Delete</button>
                <a className="text-gray-600 hover:underline" href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">View</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
