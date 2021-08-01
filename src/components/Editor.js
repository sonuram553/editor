import React, { useMemo, useState } from "react";
import { createEditor, Element, Node, Transforms } from "slate";
import { Slate, Editable, withReact } from "slate-react";

export const Editor = () => {
  const editor = useMemo(() => withParagraphs(withReact(createEditor())), []);
  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [
        { text: "This is a para." },
        { type: "paragraph", children: [{ text: "This is a para." }] },
        { type: "paragraph", children: [{ text: "This is a para." }] },
      ],
    },
  ]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <Editable />
    </Slate>
  );
};

const withParagraphs = (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // If the element is a paragraph, ensure its children are valid.
    if (Element.isElement(node) && node.type === "paragraph") {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && !editor.isInline(child)) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};
