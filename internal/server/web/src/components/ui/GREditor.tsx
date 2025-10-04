import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import "./style.css";

interface TextEditorProps {
  handleEdit: (editor: string, id?: number) => void;
  value: string | undefined;
  placeholder?: string;
  className?: string;
  id?: number;
}
const GREditor: React.FC<TextEditorProps> = ({
  handleEdit,
  value,
  placeholder,
  id,
}) => {
  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: placeholder || "xxx",
        }),
      ],
      content: value || "",
      onUpdate({ editor }) {
        const content = editor.getText().length === 0 ? "" : editor.getHTML();
        handleEdit(content, id);
      },
    },
    [placeholder],
  );

  useEffect(() => {
    if (!editor) return;

    // Prevent unnecessary re-render loops
    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value);
    }

    // Handle case when value becomes empty
    if (!value && editor.getText().length > 0) {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  return (
    <div className="border border-gray-300 p-2 rounded-md">
      <EditorContent
        editor={editor}
        className="[&_div.ProseMirror]:outline-none [&_div.ProseMirror]:focus:outline-none prose max-w-none focus:outline-none min-h-[150px] max-h-[300px] overflow-y-auto text-gray-700 list-disc list-inside [&_ul]:pl-0 [&_ol]:pl-0"
      />
    </div>
  );
};
export default GREditor;
