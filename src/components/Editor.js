import React, { useMemo, useState } from "react";
import { createEditor, Text } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { jsx } from "slate-hyperscript";

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

const deserialize = (el) => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  }

  let children = Array.from(el.childNodes).map(deserialize);
  if (children.length === 0) {
    children = [{ text: "" }];
  }

  switch (el.nodeName) {
    case "BODY":
      return jsx("fragment", {}, children);

    case "BR":
      return "\n";

    case "BLOCKQUOTE":
      return jsx("element", { type: "quote" }, children);

    case "P":
      return jsx("element", { type: "paragraph" }, children);

    case "A":
      return jsx(
        "element",
        { type: "link", url: el.getAttribute("href") },
        children
      );

    default:
      return el.textContent;
  }
};

const html = `
<p>An opening paragraph with a <a href="https://example.com">link</a> in it.</p>
<blockquote><p>A wise quote.</p></blockquote>
<p>A closing paragraph!</p>
`;
const doc = new DOMParser().parseFromString(html, "text/html");
console.log(deserialize(doc.body));
