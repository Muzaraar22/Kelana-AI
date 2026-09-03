import { Fragment, type ReactNode } from "react";

// Minimal Markdown renderer for the assistant's answers. Bedrock replies with a
// small, predictable subset — **bold**, `important`, *italic*, "- " bullets,
// "1." lists, "#" headings — so we parse that by hand rather than pull in a full
// markdown dependency. Anything unrecognised falls through as plain text.

const INLINE_RE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_)/g;

function renderInline(text: string): ReactNode[] {
  return text
    .split(INLINE_RE)
    .filter((part) => part !== "")
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-50">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        // Bedrock is prompted to mark must-know caveats with backticks — surface
        // those as a highlight rather than monospace code.
        return (
          <mark
            key={i}
            className="rounded bg-amber-100 px-1 py-0.5 font-medium text-amber-900 dark:bg-amber-400/20 dark:text-amber-200"
          >
            {part.slice(1, -1)}
          </mark>
        );
      }
      if (
        (part.startsWith("*") && part.endsWith("*")) ||
        (part.startsWith("_") && part.endsWith("_"))
      ) {
        return (
          <em key={i} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      return <Fragment key={i}>{part}</Fragment>;
    });
}

type Block =
  | { type: "heading"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string };

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    }
  };

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (trimmed === "") {
      flushPara();
      continue;
    }

    const heading = trimmed.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      flushPara();
      blocks.push({ type: "heading", text: heading[1] });
      continue;
    }

    const ul = trimmed.match(/^[-*+]\s+(.*)$/);
    if (ul) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last?.type === "ul") last.items.push(ul[1]);
      else blocks.push({ type: "ul", items: [ul[1]] });
      continue;
    }

    const ol = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (ol) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last?.type === "ol") last.items.push(ol[1]);
      else blocks.push({ type: "ol", items: [ol[1]] });
      continue;
    }

    para.push(trimmed);
  }
  flushPara();
  return blocks;
}

export default function RichText({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className="space-y-2.5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <p key={i} className="font-display text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
              {renderInline(block.text)}
            </p>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 marker:text-zinc-400">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5 marker:text-zinc-400">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }
        return <p key={i}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
