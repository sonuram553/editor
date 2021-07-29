import React, { useMemo, useState } from "react";
import { createEditor, Text } from "slate";
import { Slate, Editable, withReact } from "slate-react";

export const Editor = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(defaultValue);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <p>
        <button
          onClick={() => {
            console.log(serialize(editor));
          }}
        >
          Get HTML
        </button>
      </p>
      <Editable />
    </Slate>
  );
};

const serialize = (node) => {
  if (Text.isText(node)) {
    if (node.bold) {
      return `<strong>${node.text}</strong>`;
    }
    return node.text;
  }

  const children = node.children.map((n) => serialize(n)).join("");

  switch (node.type) {
    case "quote":
      return `<blockquote><p>${children}</p></blockquote>`;
    case "paragraph":
      return `<p>${children}</p>`;
    case "link":
      return `<a href="${node.url}">${children}</a>`;
    default:
      return children;
  }
};

const defaultValue = [
  {
    type: "paragraph",
    children: [
      { text: "An opening paragraph with a " },
      {
        type: "link",
        url: "https://example.com",
        children: [{ text: "link" }],
      },
    ],
  },
  { type: "quote", children: [{ text: "A wise quote." }] },
  { type: "paragraph", children: [{ text: "A closing paragraph!" }] },
];
