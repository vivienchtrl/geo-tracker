import { useState, useEffect } from 'react'

export const useIsMobile = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Check initial size
    checkMobile()

    // Add resize listener
    window.addEventListener('resize', checkMobile)

    // Cleanup listener
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}