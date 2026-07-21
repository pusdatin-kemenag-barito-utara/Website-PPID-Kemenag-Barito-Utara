"use client";

import { useState, useEffect } from "react";
import { Accessibility, Volume2, Type, Eye, RefreshCw, VolumeX } from "lucide-react";

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Apply Font Size class to document root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("text-scale-large", "text-scale-xlarge");
    if (fontSize === "large") root.classList.add("text-scale-large");
    if (fontSize === "xlarge") root.classList.add("text-scale-xlarge");
  }, [fontSize]);

  // Apply High Contrast class
  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add("high-contrast-mode");
    } else {
      root.classList.remove("high-contrast-mode");
    }
  }, [isHighContrast]);

  // Text-to-Speech Handler
  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Browser Anda tidak mendukung Text-to-Speech.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const mainText = document.querySelector("main")?.innerText || "";
    if (!mainText) return;

    const utterance = new SpeechSynthesisUtterance(mainText.slice(0, 500)); // Read first 500 chars
    utterance.lang = "id-ID";
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleReset = () => {
    setFontSize("normal");
    setIsHighContrast(false);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Trigger Button with Vibrant Gradient & Animation */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center p-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-[#007144] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-emerald-500/20"
        title="Fitur Aksesibilitas Disabilitas"
        aria-label="Aksesibilitas Disabilitas"
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 opacity-0 group-hover:opacity-30 blur-md transition-opacity" />
        <Accessibility className="w-6 h-6 animate-bounce text-white relative z-10" />
      </button>

      {/* Widget Popover Panel */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-72 bg-card border border-border/80 rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2 text-[#007144] font-extrabold text-sm">
              <Accessibility className="w-4 h-4" />
              <span>Aksesibilitas Difabel</span>
            </div>
            <button 
              onClick={handleReset}
              className="p-1 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 font-semibold"
              title="Reset Pengaturan"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Font Size Option */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#007144]" /> Ukuran Teks
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-accent/40 p-1 rounded-xl">
              <button
                onClick={() => setFontSize("normal")}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  fontSize === "normal" ? "bg-[#007144] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  fontSize === "large" ? "bg-[#007144] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize("xlarge")}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  fontSize === "xlarge" ? "bg-[#007144] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                A++
              </button>
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#007144]" /> Kontras Layar
            </label>
            <button
              onClick={() => setIsHighContrast(!isHighContrast)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                isHighContrast 
                  ? "bg-amber-500 text-black border-amber-600 shadow-xs" 
                  : "bg-accent/40 text-foreground border-border/60 hover:bg-accent"
              }`}
            >
              <span>{isHighContrast ? "Kontras Tinggi Aktif" : "Mode Standar"}</span>
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Text to Speech */}
          <div className="space-y-2 pt-1 border-t border-border/40">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#007144]" /> Pembaca Halaman (Suara)
            </label>
            <button
              onClick={handleSpeak}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isSpeaking
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-[#007144]/15 text-[#007144] hover:bg-[#007144] hover:text-white"
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Hentikan Suara</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Bacakan Isi Halaman</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
