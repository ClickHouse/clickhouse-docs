import React, {useEffect, useRef} from 'react';
import clsx from "clsx";
import styles from "./styles.module.css";

function ScrollableElement({type: Type = 'div', children, className, ...props}) {
  const elRef = useRef();
  
  useEffect(() => {
    const el = elRef.current;
    if (el) {
      const onWheel = (e) => {
        console.log(e)
        if (e.deltaY == 0) return;
        
        e.preventDefault()
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
        let pixelDelta = 0
        if (e.deltaMode === 0) {
          pixelDelta = delta
        } else if (e.deltaMode === 1) {
          pixelDelta = delta / 10
        }
        e.currentTarget.scrollLeft += pixelDelta
      };
      el.addEventListener("wheel", onWheel);
      return () => el.removeEventListener("wheel", onWheel);
    }
  }, []);
  
  return (
    <Type ref={elRef} className={clsx(styles.scrollableElement, className)} {...props}>{children}</Type>
  );
}

export default ScrollableElement;