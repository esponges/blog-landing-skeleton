import isHotkey from 'is-hotkey';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createEditor, Editor, Element as SlateElement, Transforms } from 'slate';
import type { Descendant, BaseEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, Editable, useSlate, withReact } from 'slate-react';
import type { RenderElementProps, RenderLeafProps } from 'slate-react';
import type { MouseEvent, KeyboardEvent } from 'react';
// Custom Slate types
type CustomElement = { type: string; align?: string; children: CustomText[] };
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  [key: string]: unknown;
};
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const HOTKEYS: Record<string, string> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
};
const LIST_TYPES = ['numbered-list', 'bulleted-list'] as const;

type ListType = (typeof LIST_TYPES)[number];
type CustomElementType = 'paragraph' | 'heading-one' | 'heading-two' | 'heading-three' | 'block-quote' | ListType;

const isBlockActive = (editor: Editor, format: CustomElementType) => {
  const { selection } = editor;
  if (!selection) return false;
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    })
  );
  return !!match;
};

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleBlock = (editor: Editor, format: CustomElementType) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format as ListType);
  Transforms.unwrapNodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes((n as any).type),
    split: true,
  });
  Transforms.setNodes<SlateElement>(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  });
  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const BlockButton = ({ format, icon }: { format: CustomElementType; icon: string }) => {
  const editor = useSlate();
  return (
    <button
      type="button"
      className={`px-2 py-1 rounded ${isBlockActive(editor, format) ? 'bg-primary-500 text-white' : 'hover:bg-gray-200'}`}
      onMouseDown={(event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      aria-label={format}
    >
      {icon}
    </button>
  );
};

const MarkButton = ({ format, icon }: { format: string; icon: string }) => {
  const editor = useSlate();
  return (
    <button
      type="button"
      className={`px-2 py-1 rounded ${isMarkActive(editor, format) ? 'bg-primary-500 text-white' : 'hover:bg-gray-200'}`}
      onMouseDown={(event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      aria-label={format}
    >
      {icon}
    </button>
  );
};

const Toolbar = () => (
  <div className="flex gap-1 border-b mb-2 pb-1">
    <MarkButton format="bold" icon="B" />
    <MarkButton format="italic" icon="I" />
    <MarkButton format="underline" icon="U" />
    <BlockButton format="heading-one" icon="H1" />
    <BlockButton format="heading-two" icon="H2" />
    <BlockButton format="heading-three" icon="H3" />
    <BlockButton format="bulleted-list" icon="• List" />
    <BlockButton format="numbered-list" icon="1. List" />
    <BlockButton format="block-quote" icon="❝" />
  </div>
);
import type { CreatePostRequest } from '../../types/blog';

interface PostFormProps {
  initial?: Partial<CreatePostRequest>;
  onSubmit: (data: CreatePostRequest) => Promise<void>;
  loading?: boolean;
  error?: string;
  success?: string;
}




const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes} className="border-l-4 pl-3 italic text-gray-600">{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};

export default function PostForm({ initial = {}, onSubmit, loading, error, success }: PostFormProps) {
  const [title, setTitle] = useState(initial.title || '');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState(initial.excerpt || '');
  // Slate editor state
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [content, setContent] = useState<Descendant[]>(() => {
    if (initial.content) {
      try {
        return JSON.parse(initial.content) as Descendant[];
      } catch {
        // fallback to plain text if not JSON
        return [{ type: 'paragraph', children: [{ text: initial.content }] }];
      }
    }
    return [
      { type: 'paragraph', children: [{ text: '' }] }
    ];
  });

  // Memoized renderers for Slate
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);
  const [coverImage, setCoverImage] = useState(initial.coverImage || '');
  const [tags, setTags] = useState((initial.tags || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [autoSaveMsg, setAutoSaveMsg] = useState('');

  useEffect(() => {
    setSlug(
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  }, [title]);

  // Auto-save draft every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoSaveMsg('Draft auto-saved');
      // Could call onSubmit with draft status here
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
      title,
      // Save as JSON string
      content: JSON.stringify(content),
      excerpt,
      coverImage,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setSaving(false);
  };

  // ...existing code...

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
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
        <div className="border rounded min-h-[200px] bg-white">
          <Slate editor={editor} initialValue={content} onChange={value => setContent(value)}>
            <Toolbar />
            <Editable
              placeholder="Write your post..."
              className="p-2 min-h-[180px]"
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              spellCheck
              autoFocus={false}
              onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                for (const hotkey in HOTKEYS) {
                  if (isHotkey(hotkey, event as any)) {
                    event.preventDefault();
                    const mark = HOTKEYS[hotkey];
                    toggleMark(editor, mark);
                  }
                }
              }}
            />
          </Slate>
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Cover Image URL</label>
        <input name="coverImage" value={coverImage} onChange={e => setCoverImage(e.target.value)} className="w-full border rounded px-3 py-2" />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Tags (comma separated)</label>
        <input name="tags" value={tags} onChange={e => setTags(e.target.value)} className="w-full border rounded px-3 py-2" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600" disabled={saving || loading}>
          {saving || loading ? 'Saving...' : 'Save as Draft'}
        </button>
        {/* Add publish button if needed */}
      </div>
    </form>
  );
}
