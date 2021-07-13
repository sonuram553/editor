import React, { useCallback, useMemo, useState } from "react";
import { Slate, Editable, withReact } from "slate-react";
import { createEditor } from "slate";
import { CustomEditor } from "./CustomEditor";

export const Editor = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
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
        localStorage.setItem("editorContent", JSON.stringify(value));
      }}
    >
      <div>
        <button onClick={() => CustomEditor.toggleBoldMark(editor)}>
          Bold
        </button>
        <button onClick={() => CustomEditor.toggleCodeBlock(editor)}>
          Code
        </button>
      </div>
      <Editable
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
  return (
    JSON.parse(localStorage.getItem("editorContent")) || [
      {
        type: "paragraph",
        children: [{ text: "This is the first line of a paragraph." }],
      },
    ]
  );
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
