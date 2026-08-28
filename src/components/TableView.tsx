interface TableViewProps {
  headers: string[];
  rows: string[][];
}

// Renders inline markdown: `code`, **bold**
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Code
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
    // Bold
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
    // Plain text up to next marker
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

export default function TableView({ headers, rows }: TableViewProps) {
  return (
    <div className="my-3 overflow-x-auto rounded-lg border border-slate-700/60">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-800/60">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="border-b border-slate-700/60 px-4 py-2.5 font-semibold text-slate-200"
              >
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-800/40 last:border-0 transition-colors hover:bg-slate-800/30">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-slate-300">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
