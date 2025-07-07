import * as React from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // This media query is a more reliable way to check for touch-primary devices
    // than just checking screen width. It will correctly identify a phone even
    // in landscape mode.
    const mql = window.matchMedia("(pointer: coarse)")

    const checkDevice = () => {
      setIsMobile(mql.matches)
    }

    checkDevice() // Initial check
    mql.addEventListener("change", checkDevice)

    return () => mql.removeEventListener("change", checkDevice)
  }, [])

  return isMobile
}
