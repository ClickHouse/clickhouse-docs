import React, {useState, useRef, useCallback, useEffect} from 'react';
import styles from './styles.module.css';
import CodeViewer from "../../components/CodeViewer";

function countLines(text = '') {
  if (typeof text !== 'string') {
    return 1; // Default to 1 line for non-string inputs
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    return 1; // Return 1 for empty or whitespace-only strings
  }

  const lines = trimmedText.split('\n');
  return Math.max(1, lines.length); // Ensure at least 1 line is returned
}

function parseMetaString(meta = '') {
  const result = {}
  const implicit_settings = ['runnable', 'run', 'show_statistics', 'click_ui', 'editable']

  meta.split(' ').forEach((part) => {
    if (!part) return

    const [rawKey, ...rawValueParts] = part.split('=')
    const key = rawKey?.trim()
    const rawValue = rawValueParts.join('=').trim()

    if (key && rawValue) {
      // Remove surrounding single or double quotes if present
      const cleanedValue = rawValue.replace(/^['"]|['"]$/g, '')
      result[key] = cleanedValue
    } else if (key && implicit_settings.includes(key)) {
      result[key] = 'true'
    }
  })

  return result
}

export default function CodeBlockWrapper(props) {
  const lineHeight = 18.85;
  const [isLoaded, setIsLoaded] = useState(false);
  const [estimatedHeight, setEstimatedHeight] = useState(countLines(props.children)*lineHeight);
  const codeBlockRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isLoaded]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '200px 0px',
    });

    const currentRef = codeBlockRef.current; // Store current ref value

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) { // Use stored ref value here as well
        observer.unobserve(currentRef);
      }
    };
  }, [handleIntersection]); // Add handleIntersection to dependency array

  const settings = parseMetaString(props.metastring);
  settings['language'] = props.className ? props.className.replace('language-', ''): 'txt';

  if (!isLoaded) {
    return (
        <div ref={codeBlockRef} className={styles.wrapper} style={{ height: estimatedHeight + 'px' }}>
            {/* Invisible content for crawlers/SEO */}
            <div style={{
              position: 'absolute',
              left: '-9999px',
              top: '-9999px',
              opacity: 0,
              pointerEvents: 'none',
              width: '1px',
              height: '1px',
              overflow: 'hidden'
            }}>
              <pre className={`language-${settings.language}`}>
                <code className={`language-${settings.language}`}>
                  {typeof props.children === 'string' ? props.children : ''}
                </code>
              </pre>
            </div>

            {/* Visible loading animation */}
            <div className={styles.activity}></div>
        </div>
    );
  }

  return (
    <>
        <CodeViewer {...settings}>
          {props.children}
        </CodeViewer>
    </>
  );
}
