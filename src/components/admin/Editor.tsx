import React, { useMemo, useCallback } from 'react';
import { createEditor, Editor, Element as SlateElement, Transforms } from 'slate';
import type { Descendant, BaseEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, Editable, useSlate, withReact } from 'slate-react';
import type { RenderElementProps, RenderLeafProps } from 'slate-react';
import isHotkey from 'is-hotkey';

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
      onMouseDown={event => {
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
      onMouseDown={event => {
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

interface EditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  className?: string;
  placeholder?: string;
}

export default function CustomEditor({ value, onChange, className = '', placeholder = 'Write your post...' }: EditorProps) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);

  return (
    <div className={`border rounded min-h-[200px] bg-white ${className}`}>
      <Slate editor={editor} initialValue={value} onChange={onChange}>
        <Toolbar />
        <Editable
          placeholder={placeholder}
          className="p-2 min-h-[180px]"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          spellCheck
          autoFocus={false}
          onKeyDown={event => {
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
  );
}
