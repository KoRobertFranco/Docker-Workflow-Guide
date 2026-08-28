// Lightweight syntax highlighter — produces HTML string with spans
// Supports: dockerfile, bash, powershell, yaml, sql, env, text

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

interface Token {
  type: string;
  value: string;
}

const tokenizeBash = (code: string): Token[] => {
  const tokens: Token[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('#')) {
      tokens.push({ type: 'comment', value: line });
      if (i < lines.length - 1) tokens.push({ type: 'newline', value: '\n' });
      continue;
    }
    // Match commands and arguments
    const parts = line.split(/(\s+)/);
    let isFirstWord = true;
    for (const part of parts) {
      if (part === '') continue;
      if (/^\s+$/.test(part)) {
        tokens.push({ type: 'whitespace', value: part });
        continue;
      }
      if (part.startsWith('#')) {
        tokens.push({ type: 'comment', value: part });
        continue;
      }
      if (isFirstWord) {
        if (part === 'docker' || part === 'cd' || part === 'cp' || part === 'cat' || part === 'ls' || part === 'dir' || part === 'ssh' || part === 'sqlcmd' || part === 'copy' || part === 'type' || part === 'netstat' || part === 'notepad' || part === 'nano') {
          tokens.push({ type: 'command', value: part });
        } else {
          tokens.push({ type: 'text', value: part });
        }
        isFirstWord = false;
      } else if (part.startsWith('-')) {
        tokens.push({ type: 'flag', value: part });
      } else if (part.startsWith('"') || part.startsWith("'")) {
        tokens.push({ type: 'string', value: part });
      } else if (/^\d+$/.test(part)) {
        tokens.push({ type: 'number', value: part });
      } else {
        tokens.push({ type: 'text', value: part });
      }
    }
    if (i < lines.length - 1) tokens.push({ type: 'newline', value: '\n' });
  }
  return tokens;
};

const tokenizePowershell = tokenizeBash;

const tokenizeDockerfile = (code: string): Token[] => {
  const tokens: Token[] = [];
  const keywords = ['FROM', 'WORKDIR', 'COPY', 'RUN', 'EXPOSE', 'ENV', 'VOLUME', 'ENTRYPOINT', 'ARG', 'USER', 'AS', 'LABEL', 'CMD', 'ADD', 'HEALTHCHECK'];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (trimmed.startsWith('#')) {
      tokens.push({ type: 'comment', value: line });
      if (i < lines.length - 1) tokens.push({ type: 'newline', value: '\n' });
      continue;
    }
    // Check if line starts with a keyword
    const firstWord = trimmed.split(/\s/)[0];
    if (keywords.includes(firstWord)) {
      const leadingWs = line.substring(0, line.length - trimmed.length);
      if (leadingWs) tokens.push({ type: 'whitespace', value: leadingWs });
      tokens.push({ type: 'keyword', value: firstWord });
      const rest = trimmed.substring(firstWord.length);
      // Highlight strings in rest
      let remaining = rest;
      while (remaining.length > 0) {
        const stringMatch = remaining.match(/^("[^"]*"|\{[^}]*\}|'[^']*')/);
        if (stringMatch) {
          tokens.push({ type: 'string', value: stringMatch[0] });
          remaining = remaining.substring(stringMatch[0].length);
          continue;
        }
        const wsMatch = remaining.match(/^\s+/);
        if (wsMatch) {
          tokens.push({ type: 'whitespace', value: wsMatch[0] });
          remaining = remaining.substring(wsMatch[0].length);
          continue;
        }
        const wordMatch = remaining.match(/^[^\s"{}]+/);
        if (wordMatch) {
          if (keywords.includes(wordMatch[0])) {
            tokens.push({ type: 'keyword', value: wordMatch[0] });
          } else if (/^--?/.test(wordMatch[0])) {
            tokens.push({ type: 'flag', value: wordMatch[0] });
          } else {
            tokens.push({ type: 'text', value: wordMatch[0] });
          }
          remaining = remaining.substring(wordMatch[0].length);
          continue;
        }
        tokens.push({ type: 'text', value: remaining[0] });
        remaining = remaining.substring(1);
      }
    } else {
      tokens.push({ type: 'text', value: line });
    }
    if (i < lines.length - 1) tokens.push({ type: 'newline', value: '\n' });
  }
  return tokens;
};

const tokenizeYaml = (code: string): Token[] => {
  const tokens: Token[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (trimmed.startsWith('#')) {
      tokens.push({ type: 'comment', value: line });
      if (i < lines.length - 1) tokens.push({ type: 'newline', value: '\n' });
      continue;
    }
    const leadingWs = line.substring(0, line.length - trimmed.length);
    if (leadingWs) tokens.push({ type: 'whitespace', value: leadingWs });

    // Match key: value pattern
    const keyMatch = trimmed.match(/^([\w-]+)(:)(.*)$/);
    if (keyMatch) {
      tokens.push({ type: 'keyword', value: keyMatch[1] });
      tokens.push({ type: 'punctuation', value: keyMatch[2] });
      const rest = keyMatch[3];
      if (rest.trim()) {
        tokens.push({ type: 'whitespace', value: ' ' });
        // Check for comments in value
        const commentIdx = rest.indexOf('#');
        let valuePart = rest;
        let commentPart = '';
        if (commentIdx >= 0 && rest.trim().startsWith('#')) {
          tokens.push({ type: 'comment', value: rest });
        } else {
          if (commentIdx >= 0) {
            valuePart = rest.substring(0, commentIdx);
            commentPart = rest.substring(commentIdx);
          }
          // Tokenize value part
          let remaining = valuePart;
          while (remaining.length > 0) {
            const wsMatch = remaining.match(/^\s+/);
            if (wsMatch && remaining === valuePart) {
              remaining = remaining.substring(wsMatch[0].length);
              continue;
            }
            const stringMatch = remaining.match(/^"[^"]*"/);
            if (stringMatch) {
              tokens.push({ type: 'string', value: stringMatch[0] });
              remaining = remaining.substring(stringMatch[0].length);
              continue;
            }
            const listMatch = remaining.match(/^(-)/);
            if (listMatch) {
              tokens.push({ type: 'punctuation', value: listMatch[0] });
              remaining = remaining.substring(1);
              continue;
            }
            const wordMatch = remaining.match(/^[^\s]+/);
            if (wordMatch) {
              if (/^\$\{.+\}$/.test(wordMatch[0])) {
                tokens.push({ type: 'variable', value: wordMatch[0] });
              } else if (/^\d+$/.test(wordMatch[0])) {
                tokens.push({ type: 'number', value: wordMatch[0] });
              } else {
                tokens.push({ type: 'text', value: wordMatch[0] });
              }
              remaining = remaining.substring(wordMatch[0].length);
              continue;
            }
            tokens.push({ type: 'text', value: remaining[0] });
            remaining = remaining.substring(1);
          }
          if (commentPart) tokens.push({ type: 'comment', value: commentPart });
        }
      }
    } else {
      tokens.push({ type: 'text', value: trimmed });
    }
    if (i < lines.length - 1) tokens.push({ type: 'newline', value: '\n' });
  }
  return tokens;
};

const tokenizeSql = (code: string): Token[] => {
  const tokens: Token[] = [];
  const keywords = ['IF', 'BEGIN', 'END', 'GO', 'USE', 'CREATE', 'TABLE', 'PRIMARY', 'KEY', 'IDENTITY', 'NOT', 'NULL', 'INT', 'NVARCHAR', 'DATABASE', 'SELECT'];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (trimmed.startsWith('--')) {
      tokens.push({ type: 'comment', value: line });
      if (i < lines.length - 1) tokens.push({ type: 'newline', value: '\n' });
      continue;
    }
    const leadingWs = line.substring(0, line.length - trimmed.length);
    if (leadingWs) tokens.push({ type: 'whitespace', value: leadingWs });
    let remaining = trimmed;
    while (remaining.length > 0) {
      const stringMatch = remaining.match(/^'[^']*'/);
      if (stringMatch) {
        tokens.push({ type: 'string', value: stringMatch[0] });
        remaining = remaining.substring(stringMatch[0].length);
        continue;
      }
      const wsMatch = remaining.match(/^\s+/);
      if (wsMatch) {
        tokens.push({ type: 'whitespace', value: wsMatch[0] });
        remaining = remaining.substring(wsMatch[0].length);
        continue;
      }
      const wordMatch = remaining.match(/^[^\s]+/);
      if (wordMatch) {
        const upper = wordMatch[0].toUpperCase();
        if (keywords.includes(upper)) {
          tokens.push({ type: 'keyword', value: wordMatch[0] });
        } else if (/^\d+$/.test(wordMatch[0])) {
          tokens.push({ type: 'number', value: wordMatch[0] });
        } else if (wordMatch[0].startsWith('(') || wordMatch[0].startsWith(')') || wordMatch[0] === ',') {
          tokens.push({ type: 'punctuation', value: wordMatch[0] });
        } else {
          tokens.push({ type: 'text', value: wordMatch[0] });
        }
        remaining = remaining.substring(wordMatch[0].length);
        continue;
      }
      tokens.push({ type: 'text', value: remaining[0] });
      remaining = remaining.substring(1);
    }
    if (i < lines.length - 1) tokens.push({ type: 'newline', value: '\n' });
  }
  return tokens;
};

const tokenizeEnv = (code: string): Token[] => {
  const tokens: Token[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('#')) {
      tokens.push({ type: 'comment', value: line });
      if (i < lines.length - 1) tokens.push({ type: 'newline', value: '\n' });
      continue;
    }
    const eqIdx = line.indexOf('=');
    if (eqIdx >= 0) {
      tokens.push({ type: 'keyword', value: line.substring(0, eqIdx) });
      tokens.push({ type: 'punctuation', value: '=' });
      tokens.push({ type: 'string', value: line.substring(eqIdx + 1) });
    } else {
      tokens.push({ type: 'text', value: line });
    }
    if (i < lines.length - 1) tokens.push({ type: 'newline', value: '\n' });
  }
  return tokens;
};

const tokenizeText = (code: string): Token[] => {
  return [{ type: 'text', value: code }];
};

const classMap: Record<string, string> = {
  comment: 'text-slate-500 italic',
  keyword: 'text-sky-400 font-medium',
  string: 'text-emerald-400',
  number: 'text-amber-400',
  flag: 'text-violet-400',
  command: 'text-sky-400 font-medium',
  variable: 'text-amber-300',
  punctuation: 'text-slate-400',
  text: 'text-slate-200',
  whitespace: '',
  newline: '',
};

export const highlight = (code: string, language: string): string => {
  let tokens: Token[];
  switch (language) {
    case 'dockerfile':
      tokens = tokenizeDockerfile(code);
      break;
    case 'bash':
      tokens = tokenizeBash(code);
      break;
    case 'powershell':
      tokens = tokenizePowershell(code);
      break;
    case 'yaml':
      tokens = tokenizeYaml(code);
      break;
    case 'sql':
      tokens = tokenizeSql(code);
      break;
    case 'env':
      tokens = tokenizeEnv(code);
      break;
    default:
      tokens = tokenizeText(code);
  }

  return tokens
    .map((t) => {
      if (t.type === 'newline') return '\n';
      if (t.type === 'whitespace') return t.value;
      const cls = classMap[t.type] || '';
      if (!cls) return escapeHtml(t.value);
      return `<span class="${cls}">${escapeHtml(t.value)}</span>`;
    })
    .join('');
};
