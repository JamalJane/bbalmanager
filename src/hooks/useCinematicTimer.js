import { useEffect, useState } from 'react'
import { useCinematic } from '../context/CinematicContext'

export function useCinematicTimer(duration) {
  const { closeCinematic } = useCinematic()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(elapsed / duration, 1)
      setProgress(newProgress)
      
      if (newProgress >= 1) {
        clearInterval(interval)
        closeCinematic()
      }
    }, 16)

    return () => clearInterval(interval)
  }, [duration, closeCinematic])

  return { progress, isComplete: progress >= 1 }
}
