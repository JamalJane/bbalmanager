import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

export function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)
  const prefersReduced = useReducedMotion()
  const frameRef = useRef()

  useEffect(() => {
    const numericTarget = typeof target === 'number' ? target : 0

    if (prefersReduced) {
      setValue(numericTarget)
      return
    }

    const startTime = performance.now()
    const startValue = 0

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(startValue + (numericTarget - startValue) * easeOut)

      setValue(currentValue)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [target, duration, prefersReduced])

  return value
}
