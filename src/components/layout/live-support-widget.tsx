"use client";

import { useState } from "react";
import { MessageSquareText, Phone, Mail, X, MessageCircle } from "lucide-react";

export function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Popover Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-card border border-border/80 rounded-3xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2 text-[#007144] font-extrabold text-sm">
              <MessageSquareText className="w-5 h-5 text-[#007144]" />
              <span>Bantuan & Contact PPID</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Butuh bantuan cepat atau konsultasi mengenai permohonan informasi publik? Hubungi tim pengelola kami:
          </p>

          <div className="space-y-2">
            <a
              href="https://wa.me/6285190002169?text=Halo%20PPID%20Kemenag%20Barito%20Utara,%20saya%20ingin%20bertanya%20mengenai%20layanan%20informasi."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[#007144] border border-emerald-500/20 transition-all text-xs font-bold"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#007144] text-white">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-extrabold">WhatsApp Official</span>
                  <span className="block text-[10px] text-muted-foreground font-normal">Respon cepat jam kerja</span>
                </div>
              </div>
              <span className="text-[10px] bg-[#007144] text-white px-2 py-0.5 rounded-full font-extrabold">Chat Now</span>
            </a>

            <a
              href="tel:051921269"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-accent/40 hover:bg-accent border border-border/60 text-foreground transition-all text-xs font-bold"
            >
              <div className="p-2 rounded-xl bg-accent text-foreground">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-extrabold">Telepon Kantor</span>
                <span className="block text-[10px] text-muted-foreground font-normal">(0519) 21269</span>
              </div>
            </a>

            <a
              href="mailto:ppidkemenagbaritoutara@gmail.com"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-accent/40 hover:bg-accent border border-border/60 text-foreground transition-all text-xs font-bold"
            >
              <div className="p-2 rounded-xl bg-accent text-foreground">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-extrabold">Email Layanan</span>
                <span className="block text-[10px] text-muted-foreground font-normal">ppidkemenagbaritoutara@gmail.com</span>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Floating Animated Gradient Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#007144] via-emerald-600 to-teal-600 text-white px-5 py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-emerald-500/20 text-xs font-extrabold"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
        </span>
        <MessageSquareText className="w-5 h-5 text-white animate-pulse" />
        <span className="hidden sm:inline">Pusat Bantuan PPID</span>
      </button>
    </div>
  );
}
