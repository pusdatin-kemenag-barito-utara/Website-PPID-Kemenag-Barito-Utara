"use client";

import { Printer, FileText, X } from "lucide-react";
import Image from "next/image";

interface PdfTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData: {
    tiketId: string;
    namaPemohon: string;
    nik: string;
    rincianInformasi: string;
    tglPengajuan: string;
    status: string;
  };
}

export function PdfTicketModal({ isOpen, onClose, ticketData }: PdfTicketModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-background border border-border/80 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Action Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4 print:hidden">
          <div className="flex items-center gap-2 text-[#007144] font-extrabold text-sm">
            <FileText className="w-5 h-5 text-[#007144]" />
            <span>Bukti Tanda Terima Permohonan</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-[#007144] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#005935] shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-accent">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Printable Canvas Ticket */}
        <div id="printable-ticket" className="bg-white text-black p-6 rounded-2xl border border-gray-200 space-y-6 shadow-inner font-sans">
          
          {/* Header Instansi Logo */}
          <div className="flex items-center justify-between border-b border-gray-300 pb-4">
            <div className="flex items-center gap-3">
              <Image src="/logo-kemenag.svg" alt="Logo Kemenag" width={44} height={44} className="object-contain" />
              <div>
                <h2 className="font-extrabold text-sm text-[#007144] uppercase tracking-tight">
                  PPID KEMENTERIAN AGAMA
                </h2>
                <p className="text-[11px] font-bold text-gray-700">KABUPATEN BARITO UTARA</p>
                <p className="text-[9px] text-gray-500">Jl. A. Yani No. 85, Muara Teweh, Barito Utara, Kalteng</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#007144] text-[10px] font-extrabold uppercase border border-emerald-300">
                TANDA TERIMA RESMI
              </span>
            </div>
          </div>

          {/* Ticket ID Box */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-500 block">NOMOR REGISTRASI TIKET</span>
              <span className="text-xl font-black text-[#007144]">{ticketData.tiketId}</span>
            </div>
            <div className="w-12 h-12 bg-white rounded-lg border border-gray-300 flex items-center justify-center font-mono text-[9px] text-gray-400">
              QR CODE
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
              <span className="font-bold text-gray-500">Nama Pemohon</span>
              <span className="col-span-2 font-extrabold text-gray-900">{ticketData.namaPemohon}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
              <span className="font-bold text-gray-500">NIK Pemohon</span>
              <span className="col-span-2 font-bold text-gray-800">{ticketData.nik}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
              <span className="font-bold text-gray-500">Tanggal Pengajuan</span>
              <span className="col-span-2 font-bold text-gray-800">{ticketData.tglPengajuan}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
              <span className="font-bold text-gray-500">Status Awal Tiket</span>
              <span className="col-span-2 font-extrabold text-[#007144]">{ticketData.status}</span>
            </div>
            <div className="grid grid-cols-3 pt-1">
              <span className="font-bold text-gray-500">Rincian Informasi</span>
              <span className="col-span-2 font-medium text-gray-700 leading-snug">{ticketData.rincianInformasi}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500">
            <span>Simpan tanda terima ini untuk mengecek status permohonan secara berkala.</span>
            <span className="font-bold text-[#007144]">Portal Resmi PPID</span>
          </div>
        </div>

      </div>
    </div>
  );
}
