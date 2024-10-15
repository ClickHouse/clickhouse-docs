import { useRef } from 'react'

export default function useThrottle(callback, delay = 200) {
  const lastCall = useRef(0)

  return (...args) => {
    const now = new Date().getTime()
    if (now - lastCall.current >= delay) {
      lastCall.current = now
      callback(...args)
    }
  }
}
