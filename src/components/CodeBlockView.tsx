import { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { highlight } from '@/utils/highlighter';

interface CodeBlockViewProps {
  code: string;
  language: string;
}

const languageLabels: Record<string, string> = {
  dockerfile: 'Dockerfile',
  bash: 'Bash',
  powershell: 'PowerShell',
  yaml: 'YAML',
  sql: 'SQL',
  env: 'ENV',
  text: 'Text',
};

export default function CodeBlockView({ code, language }: CodeBlockViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const highlighted = highlight(code, language);
  const lineCount = code.split('\n').length;

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-slate-700/60 bg-slate-900/80">
      <div className="flex items-center justify-between border-b border-slate-700/60 bg-slate-800/60 px-4 py-2">
        <span className="font-mono text-xs font-medium text-slate-400">
          {languageLabels[language] || language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="max-h-[420px] overflow-auto">
        <pre className="flex text-sm leading-relaxed">
          <div className="select-none border-r border-slate-700/40 px-3 py-3 text-right font-mono text-xs text-slate-600">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <code
            className="block flex-1 overflow-x-auto px-4 py-3 font-mono text-sm"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  );
}
