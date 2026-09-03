"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility(); // Check initial position
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-background/90 dark:bg-card/90 hover:bg-card text-foreground/85 hover:text-[#007144] border border-border/80 shadow-lg hover:shadow-xl backdrop-blur-md text-xs font-bold transition-all duration-300 active:scale-95 group cursor-pointer ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Kembali ke atas halaman"
      title="Kembali ke atas"
    >
      <ChevronUp className="w-4 h-4 text-[#007144] transition-transform group-hover:-translate-y-0.5 shrink-0" />
      <span className="text-[11px] font-bold tracking-tight whitespace-nowrap">Ke Atas</span>
    </button>
  );
}
