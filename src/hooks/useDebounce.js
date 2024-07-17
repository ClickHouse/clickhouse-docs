import { useRef } from 'react'

export default function useDebounce(callback, delay = 200) {
  const timeoutRef = useRef(null)

  return (...args) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => {
      callback(...args)
    }, delay)
  }
}
