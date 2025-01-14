import { useEffect } from 'react'

export default function useClickOutside(
  ref,
  callback
) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (!ref.current?.contains(event.target)) {
        callback(event)
      }
    }

    document.addEventListener('mouseup', handleClickOutside)

    return () => {
      document.removeEventListener('mouseup', handleClickOutside)
    }
  }, [ref])
}
