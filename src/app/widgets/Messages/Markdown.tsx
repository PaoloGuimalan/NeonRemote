/**
 * Model prose, rendered.
 *
 * WHAT THIS REPLACED, AND WHY IT HAD TO GO
 * ----------------------------------------
 * Messages were rendered with `dangerouslySetInnerHTML={{ __html: content }}`,
 * which was wrong twice over.
 *
 * Wrong for DISPLAY, because the platform stores what the model actually said
 * (llm/utils/llm_response_parsing.py strips leaked call markup and returns the
 * prose unchanged). That prose is Markdown, and handed to innerHTML it renders
 * as one flat block: `**like this**` stays literally asterisks, fenced code
 * loses its box, lists lose their bullets, and every paragraph break collapses
 * because Markdown separates paragraphs with newlines and HTML ignores them.
 *
 * Wrong for SAFETY, because not all of that content is the model's. A
 * Chatterloop user's message is mirrored into a conversation the bot's owner
 * then opens, and a third-party app posts end-user text through
 * ExternalChatView. Both arrive as `Message.content` in the same list. So
 * `<img src=x onerror=...>` typed by someone else executed in the owner's
 * session - stored XSS, reachable by anyone who can message a bot.
 *
 * WHY NOT A MARKDOWN LIBRARY
 * --------------------------
 * This renders to React ELEMENTS, never to an HTML string, and that is the
 * property worth having: there is no code path here that can produce markup,
 * so the worst a parsing bug can do is render something ugly. A library that
 * emits HTML would need a sanitizer alongside it, correctly configured, to get
 * back to where this starts.
 *
 * The cost is honest: this is a deliberately small subset of Markdown, not a
 * CommonMark implementation. It covers what chat models actually emit -
 * headings, emphasis, inline code, fenced blocks, lists, blockquotes, links,
 * tables, rules - and anything it does not recognise falls through as plain
 * text rather than disappearing.
 */
import { Fragment, ReactNode } from "react";

/** A link we are willing to make clickable. */
const SAFE_LINK = /^(https?:\/\/|mailto:)/i;

// ------------------------------------------------------------------ inline --

type InlineRule = {
  pattern: RegExp;
  render: (match: RegExpExecArray, key: string) => ReactNode;
};

/**
 * Order matters: `**bold**` has to be tried before `*italic*`, and inline code
 * before both so backticks win over the emphasis inside them - `` `a*b*c` ``
 * is code containing asterisks, not code containing italics.
 */
const INLINE_RULES: InlineRule[] = [
  {
    pattern: /`([^`\n]+)`/,
    render: (m, key) => (
      <code
        key={key}
        className="px-[5px] py-[1px] rounded-[4px] bg-black/[0.06] font-mono text-[0.9em] break-words"
      >
        {m[1]}
      </code>
    ),
  },
  // EMPHASIS IS FLANKING-AWARE. `(?!\s)` opens on non-space and the trailing
  // `[^\s*]` closes on non-space, the way CommonMark's flanking rules do.
  // Without it "it cost 5 * 3 * 4" renders " 3 " in italics - and the user's
  // own messages go through this renderer too, not just model prose, so plain
  // arithmetic in a question must survive it.
  {
    pattern: /\*\*(?!\s)([^\n]*?[^\s*])\*\*/,
    render: (m, key) => <strong key={key}>{renderInline(m[1], `${key}-i`)}</strong>,
  },
  {
    pattern: /__(?!\s)([^\n]*?[^\s_])__/,
    render: (m, key) => <strong key={key}>{renderInline(m[1], `${key}-i`)}</strong>,
  },
  {
    pattern: /~~(?!\s)([^\n]*?[^\s~])~~/,
    render: (m, key) => <del key={key}>{renderInline(m[1], `${key}-i`)}</del>,
  },
  {
    // Single `*`; the bold rule above has already claimed doubled delimiters.
    pattern: /\*(?!\s)([^*\n]*[^\s*])\*/,
    render: (m, key) => <em key={key}>{renderInline(m[1], `${key}-i`)}</em>,
  },
  {
    // `_italic_` only at a non-word boundary: snake_case_identifiers are far
    // more common in this product's conversations than underscore emphasis.
    //
    // The boundary is CAPTURED rather than matched with a lookbehind, and
    // re-emitted below. Lookbehind is a parse-time syntax error on Safari
    // before 16.4, and a parse error in one regex takes the whole bundle down
    // - not just this component. Vite sets no explicit target here, so that is
    // not a risk worth carrying for two characters of convenience.
    pattern: /(^|\W)_(?!\s)([^_\n]*[^\s_])_(?=\W|$)/,
    render: (m, key) => (
      <Fragment key={key}>
        {m[1]}
        <em>{renderInline(m[2], `${key}-i`)}</em>
      </Fragment>
    ),
  },
  {
    pattern: /\[([^\]\n]*)\]\(([^)\s]+)\)/,
    render: (m, key) => {
      const [, text, href] = m;
      // A `javascript:` or `data:` href is the same injection the innerHTML
      // version allowed, just wearing Markdown syntax. Rendered as text.
      if (!SAFE_LINK.test(href)) return <Fragment key={key}>{m[0]}</Fragment>;
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-[#1f4bd8] underline underline-offset-2 break-words"
        >
          {text || href}
        </a>
      );
    },
  },
  {
    // A bare URL, so a model that pastes one without link syntax still gets a
    // clickable result. Leading boundary captured, not looked behind - see the
    // note on the rule above.
    pattern: /(^|\s)(https?:\/\/[^\s<>()]+[^\s<>().,;:!?])/,
    render: (m, key) => (
      <Fragment key={key}>
        {m[1]}
        <a
          href={m[2]}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-[#1f4bd8] underline underline-offset-2 break-words"
        >
          {m[2]}
        </a>
      </Fragment>
    ),
  },
];

/**
 * Emphasis, code, links and hard line breaks inside one block of text.
 *
 * Walks the string finding whichever rule matches EARLIEST rather than
 * applying each rule over the whole string in turn. Applying them in sequence
 * would let a later rule reach inside an earlier one's output - the reason the
 * naive version of this turns a code span containing asterisks into italics.
 */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let index = 0;

  while (rest) {
    let earliest: { at: number; match: RegExpExecArray; rule: InlineRule } | null = null;

    for (const rule of INLINE_RULES) {
      const match = rule.pattern.exec(rest);
      if (match && (earliest === null || match.index < earliest.at)) {
        earliest = { at: match.index, match, rule };
      }
    }

    if (earliest === null) {
      out.push(...withLineBreaks(rest, `${keyPrefix}-t${index}`));
      break;
    }

    if (earliest.at > 0) {
      out.push(...withLineBreaks(rest.slice(0, earliest.at), `${keyPrefix}-t${index}`));
    }
    out.push(earliest.rule.render(earliest.match, `${keyPrefix}-m${index}`));
    rest = rest.slice(earliest.at + earliest.match[0].length);
    index += 1;
  }

  return out;
}

/** Single newlines inside a paragraph, kept as visible breaks. */
function withLineBreaks(text: string, keyPrefix: string): ReactNode[] {
  const lines = text.split("\n");
  return lines.flatMap((line, i) =>
    i === 0
      ? [<Fragment key={`${keyPrefix}-l${i}`}>{line}</Fragment>]
      : [<br key={`${keyPrefix}-br${i}`} />, <Fragment key={`${keyPrefix}-l${i}`}>{line}</Fragment>],
  );
}

// ------------------------------------------------------------------- block --

const FENCE = /^```(\w*)\s*$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*(\d+)[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const RULE = /^\s*([-*_])(?:\s*\1){2,}\s*$/;
const TABLE_DIVIDER = /^\s*\|?[\s:|-]+\|[\s:|-]*$/;

const HEADING_SIZES = [
  "text-[19px] font-semibold",
  "text-[17px] font-semibold",
  "text-[15px] font-semibold",
  "text-[14px] font-semibold",
  "text-[14px] font-semibold",
  "text-[13px] font-semibold uppercase tracking-wide",
];

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/**
 * One message, as blocks.
 *
 * A hand-written loop rather than a grammar: the block types a chat model
 * reaches for are a short, flat list, and nothing here nests further than a
 * list item containing inline markup.
 */
function renderBlocks(source: string): ReactNode[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  const next = () => `b${key++}`;

  while (i < lines.length) {
    const line = lines[i];

    // Blank lines only separate blocks; the spacing is the container's job.
    if (line.trim() === "") {
      i += 1;
      continue;
    }

    // --- fenced code ------------------------------------------------------
    const fence = FENCE.exec(line);
    if (fence) {
      const language = fence[1];
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !FENCE.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      // An unterminated fence is common in a truncated reply. Everything after
      // it is still shown as code rather than being dropped.
      i += 1;
      blocks.push(
        <div key={next()} className="rounded-[8px] bg-[#1d2026] overflow-hidden">
          {language && (
            <div className="px-[10px] pt-[7px] text-[10px] uppercase tracking-wide text-[#9aa4b2] font-mono">
              {language}
            </div>
          )}
          <pre className="px-[10px] py-[8px] overflow-x-auto">
            <code className="font-mono text-[12.5px] leading-[1.55] text-[#e6e9ef] whitespace-pre">
              {body.join("\n")}
            </code>
          </pre>
        </div>,
      );
      continue;
    }

    // --- horizontal rule --------------------------------------------------
    if (RULE.test(line)) {
      blocks.push(<hr key={next()} className="border-0 border-t border-black/10 my-[2px]" />);
      i += 1;
      continue;
    }

    // --- heading ----------------------------------------------------------
    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1].length;
      blocks.push(
        <div key={next()} className={HEADING_SIZES[level - 1]}>
          {renderInline(heading[2], `h${key}`)}
        </div>,
      );
      i += 1;
      continue;
    }

    // --- table ------------------------------------------------------------
    // Recognised only with the divider row, so a single line that happens to
    // contain a pipe is not mistaken for one.
    if (line.includes("|") && i + 1 < lines.length && TABLE_DIVIDER.test(lines[i + 1])) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      blocks.push(
        <div key={next()} className="overflow-x-auto">
          <table className="border-collapse text-[13px]">
            <thead>
              <tr>
                {header.map((cell, c) => (
                  <th
                    key={c}
                    className="border border-black/10 bg-black/[0.03] px-[8px] py-[5px] text-left font-semibold"
                  >
                    {renderInline(cell, `th${key}-${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {header.map((_, c) => (
                    <td key={c} className="border border-black/10 px-[8px] py-[5px] align-top">
                      {renderInline(row[c] ?? "", `td${key}-${r}-${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // --- blockquote -------------------------------------------------------
    if (QUOTE.test(line)) {
      const body: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i])) {
        body.push(QUOTE.exec(lines[i])![1]);
        i += 1;
      }
      blocks.push(
        <blockquote
          key={next()}
          className="border-l-[3px] border-black/15 pl-[10px] text-[#4b5563] italic"
        >
          {renderInline(body.join("\n"), `q${key}`)}
        </blockquote>,
      );
      continue;
    }

    // --- lists ------------------------------------------------------------
    if (BULLET.test(line) || NUMBERED.test(line)) {
      const ordered = !BULLET.test(line) && NUMBERED.test(line);
      const items: string[] = [];
      // A list ends at the first line that is not an item of the SAME kind, so
      // a bulleted list directly after a numbered one stays two lists.
      while (i < lines.length) {
        const bullet = BULLET.exec(lines[i]);
        const numbered = NUMBERED.exec(lines[i]);
        if (!ordered && bullet) items.push(bullet[1]);
        else if (ordered && numbered) items.push(numbered[2]);
        else if (items.length && lines[i].startsWith("  ") && lines[i].trim() !== "") {
          // A wrapped continuation line belongs to the item above it.
          items[items.length - 1] += `\n${lines[i].trim()}`;
        } else break;
        i += 1;
      }

      const start = ordered ? Number(NUMBERED.exec(line)![1]) : 1;
      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag
          key={next()}
          start={ordered ? start : undefined}
          className={`${ordered ? "list-decimal" : "list-disc"} pl-[22px] flex flex-col gap-[3px]`}
        >
          {items.map((item, index) => (
            <li key={index} className="leading-[1.5]">
              {renderInline(item, `li${key}-${index}`)}
            </li>
          ))}
        </ListTag>,
      );
      continue;
    }

    // --- paragraph --------------------------------------------------------
    const body: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !FENCE.test(lines[i]) &&
      !HEADING.test(lines[i]) &&
      !QUOTE.test(lines[i]) &&
      !RULE.test(lines[i]) &&
      !BULLET.test(lines[i]) &&
      !NUMBERED.test(lines[i])
    ) {
      body.push(lines[i]);
      i += 1;
    }
    blocks.push(
      <p key={next()} className="leading-[1.55] whitespace-pre-wrap break-words">
        {renderInline(body.join("\n"), `p${key}`)}
      </p>,
    );
  }

  return blocks;
}

/**
 * Render one message's content.
 *
 * `content` is untrusted by design - it may have been typed by a Chatterloop
 * user or an end user of somebody else's app. It is only ever interpolated as
 * text or as an element child, never as markup.
 */
function Markdown({ content, className = "" }: { content: string; className?: string }) {
  if (!content?.trim()) return null;
  return (
    <div className={`flex flex-col gap-[8px] ${className}`}>{renderBlocks(content)}</div>
  );
}

export default Markdown;
