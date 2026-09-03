"use client";

import { useState } from "react";
import { MessageSquareText, Phone, Mail, X, MessageCircle } from "lucide-react";
import { trackSupportContact } from "@/lib/analytics";

export default function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
      {/* Popover Panel - Dibuat Kompak, Ramping & Proporsional */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-72 sm:w-76 bg-card/95 border border-border/80 rounded-2xl shadow-2xl p-4 space-y-3 animate-in zoom-in-95 duration-150 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-extrabold text-xs text-foreground tracking-tight">
                Pusat Bantuan PPID
              </span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                Online
              </span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
              title="Tutup Bantuan"
              aria-label="Tutup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Saluran konsultasi dan bantuan cepat permohonan informasi publik:
          </p>

          {/* Contact Channels */}
          <div className="space-y-2">
            <a
              href="https://wa.me/6285190002169?text=Halo%20PPID%20Kemenag%20Barito%20Utara,%20saya%20ingin%20bertanya%20mengenai%20layanan%20informasi."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackSupportContact('whatsapp', '085190002169')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[#007144] border border-emerald-500/25 transition-all text-xs font-bold group shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#007144] text-white shrink-0">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block font-extrabold text-xs">WhatsApp Official</span>
                  <span className="block text-[10px] text-muted-foreground font-normal">Respon cepat jam kerja</span>
                </div>
              </div>
              <span className="text-[10px] bg-[#007144] text-white px-2 py-0.5 rounded-full font-extrabold group-hover:scale-105 transition-transform">
                Chat
              </span>
            </a>

            <a
              href="tel:051921269"
              onClick={() => trackSupportContact('phone', '051921269')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/40 hover:bg-accent border border-border/60 text-foreground transition-all text-xs"
            >
              <div className="p-1.5 rounded-lg bg-accent text-foreground shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="block font-bold text-xs">Telepon Kantor</span>
                <span className="block text-[10px] text-muted-foreground font-mono">(0519) 21269</span>
              </div>
            </a>

            <a
              href="mailto:ppidkemenagbaritoutara@gmail.com"
              onClick={() => trackSupportContact('email', 'ppidkemenagbaritoutara@gmail.com')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/40 hover:bg-accent border border-border/60 text-foreground transition-all text-xs min-w-0"
            >
              <div className="p-1.5 rounded-lg bg-accent text-foreground shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="block font-bold text-xs">Email Layanan</span>
                <span className="block text-[10px] text-muted-foreground truncate">ppidkemenagbaritoutara@gmail.com</span>
              </div>
            </a>
          </div>

          <div className="pt-2 border-t border-border/40 text-[10px] text-center text-muted-foreground">
            Jam Layanan: 07.30 - 16.00 WIB
          </div>
        </div>
      )}

      {/* Floating Trigger Button - Lebih Ramping, Elegan & Proporsional */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 bg-[#007144] hover:bg-[#005935] text-white px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 text-xs font-extrabold cursor-pointer border border-emerald-400/30"
        title="Buka Pusat Bantuan PPID"
        aria-label="Pusat Bantuan PPID"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
        </span>
        <MessageSquareText className="w-4 h-4 text-white shrink-0" />
        <span className="hidden sm:inline whitespace-nowrap">Bantuan PPID</span>
        <span className="sm:hidden whitespace-nowrap">Bantuan</span>
      </button>
    </div>
  );
}