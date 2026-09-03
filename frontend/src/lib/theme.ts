import { useCallback, useEffect, useState } from "react"

const KEY = "theme"

function readStored(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === "light" || stored === "dark") return stored
  } catch {
    /* ignore */
  }
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  } catch {
    return "light"
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<"light" | "dark">(readStored)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
  }, [theme])

  const setTheme = useCallback((next: "light" | "dark") => {
    setThemeState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  return { theme, setTheme }
}