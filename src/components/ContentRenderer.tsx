import { ContentBlock } from '@/data/sections';
import CodeBlockView from './CodeBlockView';
import TableView from './TableView';

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code key={key++} className="rounded bg-slate-700/50 px-1.5 py-0.5 font-mono text-xs text-sky-300">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.substring(codeMatch[0].length);
      continue;
    }
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="font-semibold text-slate-100">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.substring(boldMatch[0].length);
      continue;
    }
    const nextCode = remaining.indexOf('`');
    const nextBold = remaining.indexOf('**');
    let nextIdx = -1;
    if (nextCode >= 0 && nextBold >= 0) nextIdx = Math.min(nextCode, nextBold);
    else if (nextCode >= 0) nextIdx = nextCode;
    else if (nextBold >= 0) nextIdx = nextBold;

    if (nextIdx > 0) {
      parts.push(<span key={key++}>{remaining.substring(0, nextIdx)}</span>);
      remaining = remaining.substring(nextIdx);
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      remaining = '';
    }
  }

  return parts;
}

export default function ContentRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      if (block.level === 3) {
        return (
          <h3 className="mt-6 mb-2 text-base font-semibold text-slate-100">
            {block.text && renderInline(block.text)}
          </h3>
        );
      }
      return (
        <h4 className="mt-4 mb-2 text-sm font-semibold text-slate-200">
          {block.text && renderInline(block.text)}
        </h4>
      );

    case 'text':
      return (
        <p className="my-2 text-sm leading-relaxed text-slate-300">
          {block.text && renderInline(block.text)}
        </p>
      );

    case 'code':
      return block.code ? (
        <CodeBlockView code={block.code.code} language={block.code.language} />
      ) : null;

    case 'table':
      return block.table ? (
        <TableView headers={block.table.headers} rows={block.table.rows} />
      ) : null;

    case 'list':
      return (
        <ul className="my-2 space-y-1.5">
          {block.items?.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500/70" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );

    default:
      return null;
  }
}
