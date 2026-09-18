"use client";

const editorFucntions = {
  Bold: {
    text: "B",
    func: () => {},
  },
  Italic: {
    text: "I",
    func: () => {},
  },
  Heading1: {
    text: "h1",
    func: () => {},
  },
  Heading2: {
    text: "h1",
    func: () => {},
  },
  Heading3: {
    text: "h1",
    func: () => {},
  },
};

const fileTree = [
  {
    type: "h1",
    children: ["This is the Post Heading"],
  },
  {
    type: "paragraph",
    children: [
      "This is the Post Paragraph.",
      "This is"
    ],
  },
];

export function Editor() {
  return (
    <>
      <div></div>
    </>
  );
}
