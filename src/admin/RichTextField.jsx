import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function RichTextField({ value, onChange }) {
  const cb = useRef(onChange);
  cb.current = onChange;

  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate: ({ editor }) => cb.current(editor.getHTML()),
  });

  const run = (fn) => () => editor && fn(editor.chain().focus()).run();

  return (
    <div>
      <div className="pe-toolbar">
        <button type="button" onClick={run((c) => c.toggleBold())}>Bold</button>
        <button type="button" onClick={run((c) => c.toggleItalic())}>Italic</button>
        <button type="button" onClick={run((c) => c.toggleHeading({ level: 3 }))}>Heading</button>
        <button type="button" onClick={run((c) => c.toggleBulletList())}>Bullets</button>
        <button type="button" onClick={run((c) => c.toggleOrderedList())}>Numbered</button>
      </div>
      <EditorContent editor={editor} className="pe-editor" />
    </div>
  );
}