import React, { useCallback, useMemo, useReducer, useState } from "react";
import { Slate, Editable, withReact } from "slate-react";
import { createEditor, Node, Transforms } from "slate";
import { CustomEditor } from "./CustomEditor";

export const Editor = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  const [value, setValue] = useState(getInitialValue());

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);
        localStorage.setItem("editorContent", serialize(value));
      }}
    >
      <div>
        <button onClick={() => CustomEditor.toggleBoldMark(editor)}>
          Bold
        </button>
        <button onClick={() => CustomEditor.toggleCodeBlock(editor)}>
          Code
        </button>
        <button
          onClick={() => {
            Transforms.select(editor, {
              path: [1, 0],
              offset: 10,
            });
            forceUpdate();
          }}
        >
          Focus
        </button>
      </div>
      <Editable
        autoFocus={ignored}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(e) => {
          if (!e.ctrlKey) return;

          switch (e.key) {
            case "`":
              e.preventDefault();
              CustomEditor.toggleCodeBlock(editor);
              break;

            case "b":
              e.preventDefault();
              CustomEditor.toggleBoldMark(editor);
              break;

            default:
              break;
          }
        }}
      />
    </Slate>
  );
};

const getInitialValue = () => {
  return [
    {
      type: "paragraph",
      children: [{ text: "This is the first line of a paragraph." }],
    },
    {
      type: "paragraph",
      children: [{ text: "This is the second line of a paragraph." }],
    },
  ];
};

const CodeElement = ({ attributes, children }) => {
  return (
    <pre {...attributes}>
      <code>{children}</code>
    </pre>
  );
};

const DefaultElement = ({ attributes, children }) => {
  return <p {...attributes}>{children}</p>;
};

const Leaf = ({ leaf, attributes, children }) => {
  return (
    <span {...attributes} style={{ fontWeight: leaf.bold ? "bold" : "normal" }}>
      {children}
    </span>
  );
};

const serialize = (value) => {
  return value && value.map((n) => Node.string(n)).join("\n");
};

const deserialize = (value) => {
  return (
    value &&
    value
      .split("\n")
      .map((line) => ({ type: "paragraph", children: [{ text: line }] }))
  );
};
