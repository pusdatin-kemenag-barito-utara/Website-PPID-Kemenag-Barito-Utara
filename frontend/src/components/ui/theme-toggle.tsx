"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme"
import { trackThemeChange } from "@/lib/analytics"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleToggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    trackThemeChange(next);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      data-analytics-event="theme_change"
      data-analytics-category="preference"
      data-analytics-label="Theme Toggle Button"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}