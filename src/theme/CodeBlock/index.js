import React, {useState, useRef, useCallback, useEffect} from 'react';
import CodeBlock from '@theme-original/CodeBlock';
import styles from './styles.module.css';

export default function CodeBlockWrapper(props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const codeBlockRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isLoaded]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '0px 0px',
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
        <div ref={codeBlockRef}>
            <div className={styles.ldsClickHouse}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div className={styles.shortBlock}></div>
            </div>
        </div>
    );
  }

    return (
        <>
            <CodeBlock {...props} />
        </>
  );
}
