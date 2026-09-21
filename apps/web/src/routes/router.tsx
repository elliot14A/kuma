/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks'
import { ChallengeStudio } from './challenges/challengeStudio'

export const AppRouter = () => {
  const [_currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/challenges',
  )

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return <ChallengeStudio />
}
