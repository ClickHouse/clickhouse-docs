// ClickHouse-native SQL syntax highlighting.
//
// This mirrors the approach used in ClickHouse's `programs/server/play.html`:
// the actual ClickHouse SQL lexer (`src/Parsers/Lexer.cpp`) is compiled to
// WebAssembly and used to tokenize SQL. We then map each token to a CSS class
// (`q-kw`, `q-id`, `q-fn`, ...) and the colors are applied in `clickhouse-sql.scss`
// using the same palette as play.html / clickhouse-client.
//
// Unlike play.html (which highlights an editable textarea via a transparent
// overlay), the docs render static code blocks, so we just split the tokens
// into lines of styled segments and let React render them.

import LEXER_WASM_BASE64 from './lexerWasm';

export interface Token {
  type: number;
  significant: boolean;
  token: string;
}

export interface Segment {
  text: string;
  className: string;
}

/// Numeric TokenType values, matching the order of the C++ enum in
/// src/Parsers/Lexer.h. Only the categories we classify are named; everything
/// else is treated as "default" (unstyled) and renders in the normal text color.
const TT = {
  Whitespace: 0,
  Comment: 1,
  BareWord: 2,
  Number: 3,
  StringLiteral: 4,
  QuotedIdentifier: 5,
  OpeningRoundBracket: 6,
  ClosingRoundBracket: 7,
  Semicolon: 13,
  Asterisk: 16,
  HereDoc: 17,
  DollarSign: 18,
  Plus: 19,
  Minus: 20,
  Slash: 21,
  Percent: 22,
  Arrow: 23,
  QuestionMark: 24,
  Colon: 25,
  Caret: 26,
  DoubleColon: 27,
  Equals: 28,
  NotEquals: 29,
  Less: 30,
  Greater: 31,
  LessOrEquals: 32,
  GreaterOrEquals: 33,
  Spaceship: 34,
  PipeMark: 35,
  Concatenation: 36,
  At: 37,
  DoubleAt: 38,
} as const;

/// SQL keywords recognized for highlighting. The lexer reports them as BareWord,
/// so we disambiguate identifiers from keywords here. Comparisons are
/// case-insensitive. Kept in sync with play.html.
const SQL_KEYWORDS = new Set([
  'ADD', 'AFTER', 'ALL', 'ALTER', 'AND', 'ANTI', 'ANY', 'ARRAY', 'AS', 'ASC', 'ASCENDING',
  'ASOF', 'AST', 'ASYNC', 'ATTACH', 'BACKUP', 'BEGIN', 'BETWEEN', 'BOTH', 'BY',
  'CACHE', 'CASCADE', 'CASE', 'CAST', 'CHANGE', 'CHANGED', 'CHECK', 'CLEAR', 'CLUSTER',
  'CODEC', 'COLLATE', 'COLUMN', 'COLUMNS', 'COMMENT', 'COMMIT', 'CONSTRAINT', 'CREATE',
  'CROSS', 'CUBE', 'CURRENT',
  'DATABASE', 'DATABASES', 'DAY', 'DEDUPLICATE', 'DEFAULT', 'DELETE', 'DESC', 'DESCENDING',
  'DESCRIBE', 'DETACH', 'DICTIONARIES', 'DICTIONARY', 'DISK', 'DISTINCT', 'DISTRIBUTED',
  'DROP', 'ELSE', 'END', 'ENGINE', 'ESTIMATE', 'EVENTS', 'EXCEPT', 'EXCHANGE', 'EXISTS',
  'EXPLAIN', 'EXPRESSION', 'EXTENDED', 'EXTRACT',
  'FALSE', 'FETCH', 'FETCHES', 'FILE', 'FILESYSTEM', 'FINAL', 'FIRST', 'FLUSH', 'FOLLOWING',
  'FOR', 'FOREIGN', 'FORMAT', 'FREEZE', 'FROM', 'FULL', 'FUNCTION',
  'GLOBAL', 'GRANT', 'GROUP', 'GROUPS', 'HAVING', 'HIERARCHICAL', 'HOUR',
  'ID', 'IDENTIFIED', 'IF', 'ILIKE', 'IN', 'INDEX', 'INF', 'INHERIT', 'INJECTIVE',
  'INNER', 'INSERT', 'INTERSECT', 'INTERVAL', 'INTO', 'INVISIBLE', 'IS', 'IS_OBJECT_ID',
  'JOIN', 'KEY', 'KEYED', 'KILL',
  'LAST', 'LATERAL', 'LAYOUT', 'LEADING', 'LEFT', 'LIFETIME', 'LIKE', 'LIMIT', 'LIMITS',
  'LIVE', 'LOCAL', 'LOGS',
  'MATERIALIZE', 'MATERIALIZED', 'MAX', 'MERGES', 'MICROSECOND', 'MILLISECOND', 'MIN',
  'MINUTE', 'MODIFY', 'MONTH', 'MOVE', 'MUTATION',
  'NAN_SQL', 'NEXT', 'NO', 'NONE', 'NOT', 'NULL', 'NULLS',
  'OFFSET', 'ON', 'ONLY', 'OPTIMIZE', 'OPTION', 'OR', 'ORDER', 'OUTER', 'OUTFILE', 'OVER',
  'PARTITION', 'PASTE', 'PERMANENTLY', 'PLAN', 'POPULATE', 'PRECEDING', 'PRECISION',
  'PREWHERE', 'PRIMARY', 'PROFILE', 'PROJECTION', 'QUARTER', 'QUERY', 'QUOTA',
  'RANDOMIZED', 'RANGE', 'RECURSIVE', 'REFRESH', 'REGEXP', 'RELOAD', 'REMOTE', 'RENAME',
  'REPLACE', 'REPLICA', 'REPLICAS', 'RESET', 'RESTORE', 'RESTRICT', 'RESTRICTIVE',
  'RETURNS', 'REVOKE', 'RIGHT', 'ROLE', 'ROLLBACK', 'ROLLUP', 'ROW', 'ROWS',
  'SAMPLE', 'SECOND', 'SELECT', 'SEMI', 'SENDS', 'SET', 'SETS', 'SETTINGS', 'SHARD',
  'SHOW', 'SIGNED', 'SOURCE', 'SQL_SECURITY', 'START', 'STEP', 'STORAGE', 'STRICT',
  'STRICTLY_ASCENDING', 'SUBPARTITION', 'SUBSTRING', 'SUSPEND', 'SYNC', 'SYNTAX', 'SYSTEM',
  'TABLE', 'TABLES', 'TEMPORARY', 'TEST', 'THEN', 'TIES', 'TIMESTAMP', 'TO', 'TOP',
  'TOTALS', 'TRACKING', 'TRAILING', 'TRANSACTION', 'TRIGGER', 'TRIM', 'TRUE', 'TRUNCATE',
  'TYPE',
  'UNBOUNDED', 'UNFREEZE', 'UNION', 'UNIQUE', 'UNSIGNED', 'UPDATE', 'USE', 'USING',
  'UUID', 'VALUES', 'VARYING', 'VIEW', 'VIRTUAL', 'VISIBLE',
  'WATCH', 'WEEK', 'WHEN', 'WHERE', 'WINDOW', 'WITH', 'WORK', 'WRITABLE',
  'XOR', 'YEAR', 'ZKPATH',
]);

interface LexerExports {
  memory: WebAssembly.Memory;
  clickhouse_lexer_size: number;
  clickhouse_lexer_create: (lexer: number, begin: number, end: number, max: number) => void;
  clickhouse_lexer_next_token: (lexer: number, beginPtr: number, endPtr: number) => number;
  clickhouse_lexer_token_is_significant: (type: number) => number;
  clickhouse_lexer_token_is_error: (type: number) => number;
  clickhouse_lexer_token_is_end: (type: number) => number;
}

let lexerPromise: Promise<LexerExports> | null = null;

/// Instantiate the embedded Lexer.wasm exactly once and cache the exports.
function loadLexer(): Promise<LexerExports> {
  if (!lexerPromise) {
    lexerPromise = (async () => {
      const binary = atob(LEXER_WASM_BASE64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const module = await WebAssembly.instantiate(bytes);
      return module.instance.exports as unknown as LexerExports;
    })().catch((e) => {
      // Reset so a later block can retry, then re-throw for this caller.
      lexerPromise = null;
      throw e;
    });
  }
  return lexerPromise;
}

/// Tokenize a SQL string using the ClickHouse lexer compiled to WASM.
async function tokenize(query: string): Promise<Token[]> {
  const exports = await loadLexer();

  const queryBytes = new TextEncoder().encode(query);

  // Ensure the linear memory is large enough to hold the lexer object, the
  // query and two 4-byte out-pointers. Grow it if necessary (each page = 64KB).
  const required = exports.clickhouse_lexer_size + queryBytes.length + 8;
  if (exports.memory.buffer.byteLength < required) {
    const pages = Math.ceil((required - exports.memory.buffer.byteLength) / 65536);
    exports.memory.grow(pages);
  }

  const buffer = exports.memory.buffer;
  let memoryOffset = 0;

  // Allocate memory for the lexer object.
  const lexer = memoryOffset;
  memoryOffset += exports.clickhouse_lexer_size;

  // Copy the query into WASM memory.
  const queryArray = new Uint8Array(buffer, memoryOffset, queryBytes.length);
  queryArray.set(queryBytes);
  const queryBegin = memoryOffset;
  memoryOffset += queryBytes.length;
  const queryEnd = memoryOffset;

  // Initialize the lexer.
  exports.clickhouse_lexer_create(lexer, queryBegin, queryEnd, Math.max(65536, queryBytes.length));

  // Out-pointers for the begin/end of each token.
  const tokenBegin = memoryOffset;
  memoryOffset += 4;
  const tokenEnd = memoryOffset;
  memoryOffset += 4;

  const view = new DataView(buffer);
  const decoder = new TextDecoder();
  const result: Token[] = [];

  while (true) {
    const tokenType = exports.clickhouse_lexer_next_token(lexer, tokenBegin, tokenEnd);
    if (
      exports.clickhouse_lexer_token_is_error(tokenType) ||
      exports.clickhouse_lexer_token_is_end(tokenType)
    ) {
      break;
    }

    const begin = view.getUint32(tokenBegin, true);
    const end = view.getUint32(tokenEnd, true);
    const token = decoder.decode(new Uint8Array(buffer, begin, end - begin));

    result.push({
      type: tokenType,
      significant: !!exports.clickhouse_lexer_token_is_significant(tokenType),
      token,
    });
  }

  return result;
}

/// Map a single token to a CSS class. For BareWords we peek at the next
/// non-whitespace token to distinguish a function call (`foo(`) from a plain
/// identifier — the lexer alone cannot tell them apart.
function tokenClass(tokens: Token[], i: number): string {
  const elem = tokens[i];
  switch (elem.type) {
    case TT.Comment:
      return 'q-com';
    case TT.Number:
      return 'q-num';
    case TT.StringLiteral:
    case TT.HereDoc:
      return 'q-str';
    case TT.QuotedIdentifier:
      return 'q-qid';
    case TT.BareWord: {
      if (SQL_KEYWORDS.has(elem.token.toUpperCase())) return 'q-kw';
      for (let j = i + 1; j < tokens.length; ++j) {
        if (tokens[j].type === TT.Whitespace) continue;
        return tokens[j].type === TT.OpeningRoundBracket ? 'q-fn' : 'q-id';
      }
      return 'q-id';
    }
    case TT.Asterisk:
    case TT.Plus:
    case TT.Minus:
    case TT.Slash:
    case TT.Percent:
    case TT.Arrow:
    case TT.QuestionMark:
    case TT.Colon:
    case TT.DoubleColon:
    case TT.Caret:
    case TT.Equals:
    case TT.NotEquals:
    case TT.Less:
    case TT.Greater:
    case TT.LessOrEquals:
    case TT.GreaterOrEquals:
    case TT.Spaceship:
    case TT.PipeMark:
    case TT.Concatenation:
    case TT.At:
    case TT.DoubleAt:
    case TT.DollarSign:
      return 'q-op';
    default:
      return '';
  }
}

/// Append `text` (which may contain newlines) to `lines`, starting a new line
/// for each `\n`. Newline characters themselves are not stored — the renderer
/// emits a `<br/>` between lines.
function pushSegment(lines: Segment[][], text: string, className: string): void {
  const parts = text.split('\n');
  for (let j = 0; j < parts.length; j++) {
    if (j > 0) lines.push([]);
    if (parts[j].length > 0) {
      lines[lines.length - 1].push({ text: parts[j], className });
    }
  }
}

/// Tokenize `code` and return it as an array of lines, where each line is an
/// array of styled segments. The result can be rendered directly by React.
export async function buildHighlightedLines(code: string): Promise<Segment[][]> {
  const tokens = await tokenize(code);

  const lines: Segment[][] = [[]];
  let consumed = 0;
  for (let i = 0; i < tokens.length; i++) {
    const text = tokens[i].token;
    consumed += text.length;
    pushSegment(lines, text, tokenClass(tokens, i));
  }

  // Any tail not covered by tokens — the lexer hit an error or the size limit.
  // Unlike play.html (an editor, where errors matter), docs code blocks often
  // show a SQL statement followed by its textual output, which is not valid
  // SQL. So we render the tail unstyled (plain) rather than as an error.
  if (consumed < code.length) {
    pushSegment(lines, code.slice(consumed), '');
  }

  return lines;
}
