import React, { useCallback, useState } from 'react';
import styles from './styles.module.scss';

interface AgentPromptProps {
  prompt: string;
  title?: string;
  description?: React.ReactNode;
  outline?: string[];
  outlineLabel?: string;
}

const CopyIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AgentPrompt: React.FC<AgentPromptProps> = ({
  prompt,
  title = 'Agent-Assisted Setup',
  description,
  outline,
  outlineLabel = 'What the agent will do',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(prompt);
      } else {
        const ta = document.createElement('textarea');
        ta.value = prompt;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* swallow — fallback already attempted */
    }
  }, [prompt]);

  return (
    <div className={styles.wrapper} data-mdast="ignore">
      <div className={styles.mainRow}>
        <div className={styles.left}>
          <span className={styles.title}>{title}</span>
        </div>
        <div className={styles.promptArea}>
          <code className={styles.promptText}>{prompt}</code>
        </div>
        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy prompt'}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
        </button>
      </div>
      {description && (
        <div className={styles.subRow}>
          <span className={styles.description}>{description}</span>
        </div>
      )}
      {outline && outline.length > 0 && (
        <details className={styles.outline}>
          <summary className={styles.outlineSummary}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.outlineChevron}
              aria-hidden="true"
            >
              <path
                d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
            <span>{outlineLabel}</span>
          </summary>
          <ol className={styles.outlineList}>
            {outline.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
};

export default AgentPrompt;
