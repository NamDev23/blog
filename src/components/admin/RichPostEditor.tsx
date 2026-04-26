'use client';

import type { ButtonHTMLAttributes } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  SquareTerminal,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
  Undo2,
  X,
} from 'lucide-react';
import CharacterCount from '@tiptap/extension-character-count';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Input } from '@/components/ui/Input';

type RichPostEditorProps = {
  value: string;
  onChange: (value: string) => void;
  featuredImage?: string;
};

type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
};

type CharacterCountStorage = {
  characters: () => number;
  words: () => number;
};

const controlClass =
  'h-10 rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.06)] px-3 text-sm font-medium text-[var(--text)] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(102,217,194,0.2)]';

const fontSizes = [
  { label: 'Default', value: '' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
];

const textColors = ['#f4f1e8', '#66d9c2', '#e7b65a', '#8fb6ff', '#d66b4d'];
const highlightColors = ['#2cb99e33', '#e7b65a40', '#8fb6ff38', '#d66b4d38'];

/**
 * Rich text editor cho nội dung bài viết admin.
 *
 * Tiptap lưu output dưới dạng HTML vì article renderer/public page đang đọc HTML
 * trực tiếp từ field `content`. Component này tập trung vào trải nghiệm biên tập;
 * API route vẫn sanitize lần cuối trước khi lưu để không tin tuyệt đối vào client.
 */
export default function RichPostEditor({ value, onChange, featuredImage }: RichPostEditorProps) {
  const [openPanel, setOpenPanel] = useState<'link' | 'image' | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [imageWidth, setImageWidth] = useState('960');
  const [imageHeight, setImageHeight] = useState('');
  const [imageError, setImageError] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    // `immediatelyRender=false` tránh mismatch hydration trong Next client component.
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
        codeBlock: {
          HTMLAttributes: {
            // Class này giúp `enhanceCodeBlocks` nhận diện code block khi render/preview.
            class: 'code-terminal-source',
          },
        },
      }),
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      LinkExtension.configure({
        // Link trong editor không tự mở khi click để admin có thể chọn/sửa link dễ hơn.
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
      }),
      ImageExtension.configure({
        // Ảnh trong bài viết lazy-load để article dài không tải tất cả media ngay.
        HTMLAttributes: {
          loading: 'lazy',
          decoding: 'async',
        },
        resize: {
          // Resize ảnh ngay trong editor giúp admin kiểm soát tỷ lệ trước khi publish.
          enabled: true,
          minWidth: 160,
          minHeight: 90,
          alwaysPreserveAspectRatio: true,
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CharacterCount,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'rich-post-editor__content prose prose-invert max-w-none min-h-[440px] px-4 py-4 text-sm leading-relaxed outline-none sm:px-5 sm:py-5',
      },
    },
    onUpdate: ({ editor: activeEditor }) => {
      // Lưu HTML mỗi lần editor thay đổi để PostEditor submit cùng form state.
      onChange(activeEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    // Khi edit post hoặc reset form, đồng bộ value bên ngoài vào Tiptap mà không
    // phát lại onUpdate để tránh vòng lặp state.
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }
  }, [editor, value]);

  const stats = useMemo(() => {
    // CharacterCount extension là nguồn chính; fallback dùng HTML stripping khi editor chưa sẵn sàng.
    const storage = editor?.storage.characterCount as CharacterCountStorage | undefined;
    return {
      words: storage?.words() || countWordsFromHtml(value),
      characters: storage?.characters() || stripHtml(value).length,
    };
  }, [editor, value]);

  const currentBlock = editor?.isActive('heading', { level: 2 })
    ? 'h2'
    : editor?.isActive('heading', { level: 3 })
      ? 'h3'
      : editor?.isActive('heading', { level: 4 })
        ? 'h4'
        : 'p';

  const currentFontSize = (editor?.getAttributes('textStyle').fontSize as string | undefined) || '';

  const openLinkPanel = useCallback(() => {
    if (!editor) return;
    // Panel link lấy URL hiện tại nếu selection đang nằm trong link.
    setOpenPanel((current) => (current === 'link' ? null : 'link'));
    setLinkUrl((editor.getAttributes('link').href as string | undefined) || '');
    setLinkError('');
  }, [editor]);

  const openImagePanel = useCallback(() => {
    if (!editor) return;
    // Nếu đang chọn ảnh thì đọc attribute hiện tại; nếu chưa có thì gợi ý featured image.
    const attrs = editor.getAttributes('image') as {
      src?: string;
      alt?: string;
      title?: string;
      width?: number | string;
      height?: number | string;
    };

    setOpenPanel((current) => (current === 'image' ? null : 'image'));
    setImageUrl(attrs.src || featuredImage || '');
    setImageAlt(attrs.alt || '');
    setImageTitle(attrs.title || '');
    setImageWidth(attrs.width ? String(attrs.width) : '960');
    setImageHeight(attrs.height ? String(attrs.height) : '');
    setImageError('');
  }, [editor, featuredImage]);

  function applyBlock(value: string) {
    if (!editor) return;

    // Paragraph và heading dùng cùng select để admin không phải nhớ phím tắt Markdown.
    if (value === 'p') {
      editor.chain().focus().setParagraph().run();
      return;
    }

    const level = Number(value.replace('h', '')) as 2 | 3 | 4;
    editor.chain().focus().toggleHeading({ level }).run();
  }

  function applyLink() {
    if (!editor) return;
    const url = normalizeLinkUrl(linkUrl);

    // URL rỗng nghĩa là xóa link khỏi selection hiện tại.
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setOpenPanel(null);
      setLinkError('');
      return;
    }

    if (!isAllowedLink(url)) {
      setLinkError('Use http, https, mailto, tel, /path, or #anchor.');
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setOpenPanel(null);
    setLinkError('');
  }

  function addOrUpdateImage() {
    if (!editor) return;
    const src = normalizeImageUrl(imageUrl);

    if (!src) {
      setImageError('Image URL must start with http:// or https://.');
      return;
    }

    const width = parseDimension(imageWidth);
    const height = parseDimension(imageHeight);
    const attrs = {
      src,
      alt: imageAlt.trim() || undefined,
      title: imageTitle.trim() || undefined,
      width: width || undefined,
      height: height || undefined,
    };

    // Nếu selection đang là ảnh thì update attribute; nếu không thì insert ảnh mới.
    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', attrs).run();
    } else {
      editor.chain().focus().setImage(attrs).run();
    }

    setOpenPanel(null);
    setImageError('');
  }

  if (!editor) {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.04)] p-5 text-sm text-[var(--text-muted)]">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="rich-post-editor overflow-hidden rounded-lg border border-[var(--line)] bg-[rgba(13,18,15,0.45)]">
      {/* Toolbar chia thành nhóm rõ ràng: block style, inline marks, list, align, media, history. */}
      <div className="border-b border-[var(--line)] bg-[rgba(244,241,232,0.035)] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <select value={currentBlock} onChange={(event) => applyBlock(event.target.value)} className={controlClass} aria-label="Block style">
            <option value="p">Paragraph</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>

          <select
            value={currentFontSize}
            onChange={(event) => {
              const size = event.target.value;
              if (size) {
                editor.chain().focus().setFontSize(size).run();
              } else {
                editor.chain().focus().unsetFontSize().run();
              }
            }}
            className={controlClass}
            aria-label="Font size"
          >
            {fontSizes.map((size) => (
              <option key={size.value || 'default'} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>

          <ToolbarButton title="Bold" isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton title="Italic" isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton title="Underline" isActive={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon size={16} />
          </ToolbarButton>
          <ToolbarButton title="Strike" isActive={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough size={16} />
          </ToolbarButton>
          <ToolbarButton title="Inline code" isActive={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
            <Code2 size={16} />
          </ToolbarButton>
          <ToolbarButton title="Code block" isActive={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
            <SquareTerminal size={16} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton title="Bullet list" isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton title="Ordered list" isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={16} />
          </ToolbarButton>
          <ToolbarButton title="Blockquote" isActive={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote size={16} />
          </ToolbarButton>
          <ToolbarButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus size={16} />
          </ToolbarButton>

          <ToolbarDivider />

          {(['left', 'center', 'right', 'justify'] as const).map((align) => {
            const Icon = {
              left: AlignLeft,
              center: AlignCenter,
              right: AlignRight,
              justify: AlignJustify,
            }[align];

            return (
              <ToolbarButton
                key={align}
                title={`Align ${align}`}
                isActive={editor.isActive({ textAlign: align })}
                onClick={() => editor.chain().focus().setTextAlign(align).run()}
              >
                <Icon size={16} />
              </ToolbarButton>
            );
          })}

          <ToolbarDivider />

          <ToolbarButton title="Link" isActive={editor.isActive('link') || openPanel === 'link'} onClick={openLinkPanel}>
            <Link2 size={16} />
          </ToolbarButton>
          <ToolbarButton title="Image" isActive={editor.isActive('image') || openPanel === 'image'} onClick={openImagePanel}>
            <ImageIcon size={16} />
          </ToolbarButton>
          <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
            <Eraser size={16} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 size={16} />
          </ToolbarButton>
          <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 size={16} />
          </ToolbarButton>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {/* Swatch màu giúp admin format nhanh mà không nhập mã màu thủ công. */}
          <div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[rgba(13,18,15,0.46)] px-2 py-1.5">
            <Type size={15} className="text-[var(--text-soft)]" />
            {textColors.map((color) => (
              <button
                key={color}
                type="button"
                title={`Text ${color}`}
                aria-label={`Text ${color}`}
                onClick={() => editor.chain().focus().setColor(color).run()}
                className="h-6 w-6 rounded-md border border-[var(--line)] transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              />
            ))}
            <button
              type="button"
              title="Reset text color"
              aria-label="Reset text color"
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--line)] text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X size={13} />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[rgba(13,18,15,0.46)] px-2 py-1.5">
            <Highlighter size={15} className="text-[var(--text-soft)]" />
            {highlightColors.map((color) => (
              <button
                key={color}
                type="button"
                title={`Highlight ${color}`}
                aria-label={`Highlight ${color}`}
                onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                className="h-6 w-6 rounded-md border border-[var(--line)] transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              />
            ))}
            <button
              type="button"
              title="Reset highlight"
              aria-label="Reset highlight"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--line)] text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Panel link inline để không cần modal, giúp editor vẫn giữ ngữ cảnh selection. */}
      {openPanel === 'link' && (
        <div className="grid gap-3 border-b border-[var(--line)] bg-[rgba(244,241,232,0.025)] p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">Link URL</span>
            <Input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://example.com" />
          </label>
          <button type="button" onClick={applyLink} className="h-11 rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-[#06100d]">
            Apply link
          </button>
          <button type="button" onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()} className="h-11 rounded-lg border border-[var(--line)] px-4 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">
            Remove
          </button>
          {linkError && <p className="text-xs text-red-300 sm:col-span-3">{linkError}</p>}
        </div>
      )}

      {/* Panel ảnh hỗ trợ alt/title/kích thước để bài viết tốt hơn cho SEO và accessibility. */}
      {openPanel === 'image' && (
        <div className="grid gap-3 border-b border-[var(--line)] bg-[rgba(244,241,232,0.025)] p-4 lg:grid-cols-[1.4fr_0.9fr_0.9fr_0.5fr_0.5fr_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">Image URL</span>
            <Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://images.unsplash.com/..." />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">Alt text</span>
            <Input value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="Dashboard screenshot" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">Caption title</span>
            <Input value={imageTitle} onChange={(event) => setImageTitle(event.target.value)} placeholder="Admin workflow" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">Width</span>
            <Input type="number" min={160} max={1600} value={imageWidth} onChange={(event) => setImageWidth(event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">Height</span>
            <Input type="number" min={90} max={1200} value={imageHeight} onChange={(event) => setImageHeight(event.target.value)} />
          </label>
          <button type="button" onClick={addOrUpdateImage} className="h-11 rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-[#06100d]">
            Apply image
          </button>
          {imageError && <p className="text-xs text-red-300 lg:col-span-6">{imageError}</p>}
        </div>
      )}

      <EditorContent editor={editor} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] bg-[rgba(244,241,232,0.025)] px-4 py-3 text-xs text-[var(--text-soft)]">
        <div className="flex items-center gap-2">
          <Pilcrow size={14} />
          <span>{stats.words} words</span>
          <span>·</span>
          <span>{stats.characters} characters</span>
        </div>
        <span>{editor.isActive('image') ? 'Image selected' : 'Rich text HTML saved to post content'}</span>
      </div>
    </div>
  );
}

function ToolbarButton({ className = '', isActive, children, ...props }: ToolbarButtonProps) {
  // Button icon cố định 40x40 để toolbar không nhảy layout khi active/disabled.
  return (
    <button
      type="button"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40 ${
        isActive
          ? 'border-[rgba(102,217,194,0.45)] bg-[rgba(102,217,194,0.14)] text-[var(--accent)]'
          : 'border-[var(--line)] bg-[rgba(244,241,232,0.04)]'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  // Divider chỉ hiện từ breakpoint sm để toolbar mobile không quá chật.
  return <span className="hidden h-8 w-px bg-[var(--line)] sm:inline-block" />;
}

function normalizeLinkUrl(value: string) {
  // Người dùng nhập `example.com` sẽ được nâng thành `https://example.com`.
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isAllowedLink(value: string) {
  // Chỉ cho scheme an toàn/thường dùng; chặn javascript/data URL ở tầng editor.
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value);
}

function normalizeImageUrl(value: string) {
  // Ảnh phải là URL http/https vì Next Image/public renderer không xử lý data URL.
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : '';
}

function parseDimension(value: string) {
  // Giới hạn kích thước để admin không vô tình tạo ảnh quá lớn làm vỡ layout.
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number)) return null;
  return Math.min(Math.max(number, 1), 1600);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWordsFromHtml(value: string) {
  const text = stripHtml(value);
  if (!text) return 0;
  return text.split(/\s+/).length;
}
