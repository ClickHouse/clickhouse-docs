import React, {useState, useRef, useCallback, useEffect} from 'react';
import CodeBlock from '@theme-original/CodeBlock';
import styles from './styles.module.css';

function countLines(text) {
  // Split the string by newline characters
  const lines = text.split('\n');
  // Return the number of lines
  return lines.length;
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

    return (
        <>
            <CodeBlock {...props} />
        </>
  );
}
