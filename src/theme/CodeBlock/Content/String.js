/**
 * Swizzled `@theme/CodeBlock/Content/String`.
 *
 * For SQL code blocks we use ClickHouse-native syntax highlighting: the actual
 * ClickHouse SQL lexer is compiled to WebAssembly (see
 * `src/components/CodeViewer/clickhouse-sql/`) and used to tokenize the query,
 * exactly like ClickHouse's `programs/server/play.html`. The colors come from
 * the same palette (`src/css/clickhouse-sql.scss`).
 *
 * Every other language is delegated to the original Docusaurus component, so
 * Prism keeps highlighting non-SQL blocks unchanged.
 */
import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import {useThemeConfig} from '@docusaurus/theme-common';
import {
  parseCodeBlockTitle,
  parseLanguage,
  parseLines,
  containsLineNumbers,
  useCodeWordWrap,
} from '@docusaurus/theme-common/internal';
import Container from '@theme/CodeBlock/Container';
import CopyButton from '@theme/CodeBlock/CopyButton';
import WordWrapButton from '@theme/CodeBlock/WordWrapButton';
import OriginalStringContent from '@theme-original/CodeBlock/Content/String';
import {buildHighlightedLines} from '@site/src/components/CodeViewer/clickhouse-sql/highlighter';

import styles from './styles.module.css';

// Prism languages are always lowercase; fail-safe and allow both "sql" and "SQL".
function normalizeLanguage(language) {
  return language?.toLowerCase();
}

function renderSegments(segments) {
  return segments.map((segment, i) =>
    segment.className ? (
      <span key={i} className={segment.className}>
        {segment.text}
      </span>
    ) : (
      <React.Fragment key={i}>{segment.text}</React.Fragment>
    ),
  );
}

// Plain (unhighlighted) fallback used during SSR and before the WASM lexer has
// loaded. Splitting on "\n" matches the highlighted output's line structure so
// there is no layout shift once highlighting kicks in.
function plainLines(code) {
  return code.split('\n').map((line) => [{text: line, className: ''}]);
}

function ClickHouseSqlCodeBlock({
  children,
  className: blockClassName = '',
  metastring,
  title: titleProp,
  showLineNumbers: showLineNumbersProp,
  magicComments,
}) {
  const wordWrap = useCodeWordWrap();
  const title = parseCodeBlockTitle(metastring) || titleProp;
  const {lineClassNames, code} = parseLines(children, {
    metastring,
    language: 'sql',
    magicComments,
  });
  const showLineNumbers = showLineNumbersProp ?? containsLineNumbers(metastring);

  // Strip a single trailing newline for display so we don't render an extra
  // blank line. The CopyButton still copies the original `code`.
  const displayCode = code.replace(/\n$/, '');

  const [lines, setLines] = useState(null);
  useEffect(() => {
    let cancelled = false;
    buildHighlightedLines(displayCode)
      .then((result) => {
        if (!cancelled) setLines(result);
      })
      .catch((e) => {
        // Fall back to the plain rendering if tokenization fails.
        // eslint-disable-next-line no-console
        console.error('ClickHouse SQL highlighting failed:', e);
        if (!cancelled) setLines(null);
      });
    return () => {
      cancelled = true;
    };
  }, [displayCode]);

  const renderedLines = lines ?? plainLines(displayCode);

  return (
    <Container
      as="div"
      className={clsx(
        blockClassName,
        !blockClassName.includes('language-sql') && 'language-sql',
      )}>
      {title && <div className={styles.codeBlockTitle}>{title}</div>}
      <div className={styles.codeBlockContent}>
        <pre
          /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
          tabIndex={0}
          ref={wordWrap.codeBlockRef}
          className={clsx('prism-code', 'language-sql', 'ch-sql', styles.codeBlock, 'thin-scrollbar')}>
          <code
            className={clsx(
              styles.codeBlockLines,
              showLineNumbers && styles.codeBlockLinesWithNumbering,
            )}>
            {renderedLines.map((segments, i) => (
              <span
                key={i}
                className={clsx('token-line', lineClassNames[i], showLineNumbers && styles.codeLine)}>
                {showLineNumbers ? (
                  <>
                    <span className={styles.codeLineNumber} />
                    <span className={styles.codeLineContent}>{renderSegments(segments)}</span>
                  </>
                ) : (
                  renderSegments(segments)
                )}
                <br />
              </span>
            ))}
          </code>
        </pre>
        <div className={styles.buttonGroup}>
          {(wordWrap.isEnabled || wordWrap.isCodeScrollable) && (
            <WordWrapButton
              className={styles.codeButton}
              onClick={() => wordWrap.toggle()}
              isEnabled={wordWrap.isEnabled}
            />
          )}
          <CopyButton className={styles.codeButton} code={code} />
        </div>
      </div>
    </Container>
  );
}

export default function CodeBlockString(props) {
  const {
    prism: {defaultLanguage, magicComments},
  } = useThemeConfig();
  const language = normalizeLanguage(
    props.language ?? parseLanguage(props.className ?? '') ?? defaultLanguage,
  );

  if (language !== 'sql') {
    return <OriginalStringContent {...props} />;
  }

  return <ClickHouseSqlCodeBlock {...props} magicComments={magicComments} />;
}
