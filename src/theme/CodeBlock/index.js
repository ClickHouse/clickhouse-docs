import React, {useState, useRef, useCallback, useEffect} from 'react';
import styles from './styles.module.css';
import CodeViewer from "../../components/CodeViewer";


function countLines(text) {
  // Handle undefined or null input
  if (!text) return 1; // Return 1 as default line count
  // Split the string by newline characters
  const lines = text.split('\n');
  // Return the number of lines
  return lines.length;
}

function parseMetaString(meta = '') {
  const result = {}
  const implicit_settings = ['runnable', 'run', 'show_statistics', 'click_ui']

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

  if (!isLoaded) {
    return (
        <div ref={codeBlockRef} className={styles.wrapper} style={{ height: estimatedHeight + 'px' }}>
            <div className={styles.activity}></div>
        </div>
    );
  }

  
  const settings = parseMetaString(props.metastring); 
  settings['language'] = props.className ? props.className.replace('language-', ''): 'txt';
  return (
    <>
        <CodeViewer {...settings}>
          {props.children}
        </CodeViewer>
    </>
  );
}
