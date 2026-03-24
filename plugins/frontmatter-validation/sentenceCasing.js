// sentenceCasing.js
// Shared sentence casing logic used by both the frontmatter validator plugin
// and the standalone sidebars checker script.
//
// Reads exceptions from styles/ClickHouse/Headings.yml (same source as Vale).

const fs = require('fs');
const path = require('path');

const HEADINGS_YML = path.join(process.cwd(), 'styles', 'ClickHouse', 'Headings.yml');

// Directories excluded from sentence casing checks (synced from core repo or legacy)
const IGNORED_DIRS = new Set([
  'development', 'engines', 'interfaces', 'operations',
  'sql-reference', '_clients', 'ru', 'zh',
  'whats-new', 'releases', 'changelogs',
]);

/**
 * Parse the exceptions list from Headings.yml without a YAML library.
 * Returns { regexPatterns: RegExp[], literalWords: Set<string> }
 */
function loadExceptions(ymlPath) {
  const filePath = ymlPath || HEADINGS_YML;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const regexPatterns = [];
  const literalWords = new Set();

  let inExceptions = false;

  for (const line of lines) {
    const stripped = line.trim();

    if (stripped === 'exceptions:') {
      inExceptions = true;
      continue;
    }

    if (inExceptions) {
      // End of exceptions block: a non-list, non-blank, non-comment line
      if (stripped && !stripped.startsWith('- ') && !stripped.startsWith('#')) {
        break;
      }

      if (!stripped.startsWith('- ')) {
        continue;
      }

      // Extract the value after "- "
      let entry = stripped.slice(2);

      // Handle quoted values (may have trailing inline comments)
      if (entry.startsWith('"')) {
        const end = entry.indexOf('"', 1);
        if (end !== -1) {
          entry = entry.slice(1, end);
        }
      } else if (entry.startsWith("'")) {
        const end = entry.indexOf("'", 1);
        if (end !== -1) {
          entry = entry.slice(1, end);
        }
      } else {
        // Unquoted: strip inline comments
        const commentIdx = entry.indexOf('  #');
        if (commentIdx !== -1) {
          entry = entry.slice(0, commentIdx).trimEnd();
        }
      }

      if (!entry) continue;

      // Unescape Vale-style backslashes (e.g., C\+\+ -> C++)
      if (entry.includes('\\') && !entry.startsWith('^')) {
        const unescaped = entry.replace(/\\/g, '');
        literalWords.add(unescaped);
        for (const word of unescaped.split(/\s+/)) {
          literalWords.add(word);
        }
        continue;
      }

      // Regex patterns start with ^ or contain *
      if (entry.startsWith('^') || entry.includes('*')) {
        try {
          regexPatterns.push(new RegExp(entry));
        } catch {
          // Skip invalid regex
        }
      } else {
        literalWords.add(entry);
        for (const word of entry.split(/\s+/)) {
          literalWords.add(word);
        }
      }
    }
  }

  return { regexPatterns, literalWords };
}

/**
 * Check a text string for sentence casing violations.
 * Returns an array of capitalized words that violate the rule.
 */
function checkSentenceCasing(text, regexPatterns, literalWords) {
  // Strip quoted substrings before checking — words inside quotes are
  // typically proper names (e.g. "What's on the Menu?") and should be exempt.
  const textWithoutQuotes = text.replace(/"[^"]*"|"[^"]*"|'[^']*'/g, match =>
    ' '.repeat(match.length)
  );
  const words = textWithoutQuotes.split(/\s+/);
  const violations = [];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (!word || !word[0] || !/[A-Z]/.test(word[0])) continue;

    // Strip surrounding punctuation for matching
    let cleaned = word.replace(/^[(\[{]+/, '');
    cleaned = cleaned.replace(/[.,;:!?)\]}>]+$/, '');

    if (!cleaned || !/[A-Z]/.test(cleaned[0])) continue;

    // Skip ClickHouse variants
    if (cleaned.startsWith('ClickHouse')) continue;

    // Check literal exceptions
    if (literalWords.has(cleaned)) continue;

    // Check if part of a multi-word exception in the full text
    let multiWordMatch = false;
    for (const exc of literalWords) {
      if (exc.includes(' ') && text.includes(exc)) {
        if (exc.split(/\s+/).includes(cleaned)) {
          multiWordMatch = true;
          break;
        }
      }
    }
    if (multiWordMatch) continue;

    // Check regex patterns
    let regexMatch = false;
    for (const pattern of regexPatterns) {
      if (pattern.test(cleaned)) {
        regexMatch = true;
        break;
      }
    }
    if (regexMatch) continue;

    violations.push(cleaned);
  }

  return violations;
}

/**
 * Check if a file path is in an ignored directory (top-level under docs/).
 */
function isInIgnoredDir(filePath) {
  // Get the path relative to the docs/ directory
  const docsPrefix = path.join('docs', path.sep);
  const relativePath = filePath.includes(docsPrefix)
    ? filePath.slice(filePath.indexOf(docsPrefix) + docsPrefix.length)
    : filePath;

  const topDir = relativePath.split(path.sep)[0];
  return IGNORED_DIRS.has(topDir);
}

module.exports = {
  loadExceptions,
  checkSentenceCasing,
  isInIgnoredDir,
  IGNORED_DIRS,
};
