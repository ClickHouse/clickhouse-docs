import React, {useEffect, useRef} from 'react';

function ScrollableDiv({children, ...props}) {
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
    <div ref={elRef} {...props}>{children}</div>
  );
}

export default ScrollableDiv;