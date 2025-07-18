import React, { useState, useEffect } from 'react';
import type { Descendant } from 'slate';
import CustomEditor from './Editor';
import type { CreatePostRequest } from '../../types/blog';

interface PostFormProps {
  initial?: Partial<CreatePostRequest>;
  onSubmit: (data: CreatePostRequest) => Promise<void>;
  loading?: boolean;
  error?: string;
  success?: string;
}

export default function PostForm({ initial = {}, onSubmit, loading, error, success }: PostFormProps) {
  const [title, setTitle] = useState(initial.title || '');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState(initial.excerpt || '');
  const [content, setContent] = useState<Descendant[]>(() => {
    if (initial.content) {
      try {
        return JSON.parse(initial.content) as Descendant[];
      } catch {
        return [{ type: 'paragraph', children: [{ text: initial.content }] }];
      }
    }
    return [
      { type: 'paragraph', children: [{ text: '' }] }
    ];
  });
  const [coverImage, setCoverImage] = useState(initial.coverImage || '');
  const [tags, setTags] = useState((initial.tags || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [autoSaveMsg, setAutoSaveMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    setSlug(
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  }, [title]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAutoSaveMsg('Draft auto-saved');
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/posts/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: JSON.stringify(content),
          excerpt,
          coverImage,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      setAutoSaveMsg('Draft saved successfully');
    } catch (error) {
      setAutoSaveMsg('Failed to save draft');
      console.error('Error saving post:', error);
    }

    setSaving(false);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setCoverImage(data.url);
        setAutoSaveMsg('Image uploaded!');
      } else {
        setUploadError(data.error?.message || 'Upload failed');
      }
    } catch (err) {
      setUploadError('Upload failed');
    }
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} encType='multipart/form-data' className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      {autoSaveMsg && <div className="mb-2 text-xs text-gray-500">{autoSaveMsg}</div>}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Title</label>
        <input name="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" required maxLength={120} />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Slug</label>
        <input name="slug" value={slug} readOnly className="w-full border rounded px-3 py-2 bg-gray-100" />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Excerpt</label>
        <input name="excerpt" value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full border rounded px-3 py-2" maxLength={200} />
        <div className="text-xs text-gray-400">{excerpt.length}/200</div>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Content</label>
        <CustomEditor value={content} onChange={setContent} />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Cover Image URL</label>
        <input name="coverImage" value={coverImage} onChange={e => setCoverImage(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
        <div className="flex gap-2 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            disabled={uploading}
          />
          {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
          {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
        </div>
        {coverImage && (
          <img src={coverImage} alt="Cover preview" className="mt-2 rounded max-h-40 border" />
        )}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Tags (comma separated)</label>
        <input name="tags" value={tags} onChange={e => setTags(e.target.value)} className="w-full border rounded px-3 py-2" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-primary-500 rounded hover:bg-primary-600 border rounded" disabled={saving || loading}>
          {saving || loading ? 'Saving...' : 'Save as Draft'}
        </button>
        {/* Add publish button if needed */}
      </div>
    </form>
  );
}
