"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { FileText, Search, CheckCircle2, Send, Mail, MessageCircle, X } from "lucide-react";

interface PermohonanItem {
  id: string;
  ticketNo: string;
  applicantName: string;
  email: string;
  phone: string;
  infoRequested: string;
  date: string;
  status: "Menunggu" | "Diproses" | "Selesai" | "Ditolak";
}

export default function AdminPermohonanPage() {
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReq, setSelectedReq] = useState<PermohonanItem | null>(null);
  const [isNotifySent, setIsNotifySent] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState("");

  const mockRequests: PermohonanItem[] = [
    {
      id: "1",
      ticketNo: "PPID-2026-001",
      applicantName: "Budi Santoso",
      email: "budi.santoso@gmail.com",
      phone: "081234567890",
      infoRequested: "Permohonan Data Realisasi Anggaran PPID Tahun 2025",
      date: "20 Jul 2026",
      status: "Menunggu",
    },
    {
      id: "2",
      ticketNo: "PPID-2026-002",
      applicantName: "Siti Rahmah",
      email: "siti.rahmah@yahoo.com",
      phone: "085298765432",
      infoRequested: "Permohonan Informasi Struktur Kepegawaian dan Formasi CPNS",
      date: "18 Jul 2026",
      status: "Diproses",
    },
    {
      id: "3",
      ticketNo: "PPID-2026-003",
      applicantName: "Ahmad Hidayat",
      email: "ahmad.hidayat@gmail.com",
      phone: "081345678901",
      infoRequested: "Permohonan SOP Layanan Pengaduan Masyarakat",
      date: "15 Jul 2026",
      status: "Selesai",
    },
  ];

  const filteredRequests = mockRequests.filter(req => {
    const matchesStatus = statusFilter === "Semua" || req.status === statusFilter;
    const matchesSearch = req.ticketNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.infoRequested.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    setIsNotifySent(true);
    setTimeout(() => {
      setIsNotifySent(false);
      setSelectedReq(null);
      setNotifyMsg("");
    }, 2500);
  };

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" /> Antrean Permohonan
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Permohonan Layanan Publik</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tinjau, proses, dan berikan tanggapan serta notifikasi Email/WA otomatis atas permohonan masuk.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <Card className="shadow-xs border border-border/60">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {["Semua", "Menunggu", "Diproses", "Selesai"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? "bg-[#007144] text-white shadow-xs"
                      : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Cari tiket atau pemohon..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-accent/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-6">No. Tiket</th>
                  <th className="py-3 px-6">Nama Pemohon</th>
                  <th className="py-3 px-6">Informasi Diminta</th>
                  <th className="py-3 px-6">Tanggal</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs font-medium">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-accent/20 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-[#007144]">{req.ticketNo}</td>
                    <td className="py-4 px-6 font-bold text-foreground">{req.applicantName}</td>
                    <td className="py-4 px-6 text-muted-foreground max-w-xs truncate">{req.infoRequested}</td>
                    <td className="py-4 px-6 text-muted-foreground whitespace-nowrap">{req.date}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        req.status === "Menunggu" ? "bg-amber-500/15 text-amber-700" :
                        req.status === "Diproses" ? "bg-blue-500/15 text-blue-700" :
                        "bg-emerald-500/15 text-[#007144]"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button 
                        onClick={() => {
                          setSelectedReq(req);
                          setNotifyMsg(`Halo Yth. ${req.applicantName}, permohonan informasi Anda dengan tiket ${req.ticketNo} saat ini berstatus ${req.status}.`);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007144] hover:bg-emerald-500/10 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Respon & Notifikasi</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Respon & Kirim Notifikasi */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background border border-border/60 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="font-extrabold text-base text-foreground">Kirim Notifikasi Pemohon</h3>
              <button onClick={() => setSelectedReq(null)} className="p-1 rounded-lg text-muted-foreground hover:bg-accent">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isNotifySent ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-[#007144] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-base text-foreground">Notifikasi Berhasil Terkirim!</h4>
                <p className="text-xs text-muted-foreground">Pesan telah dikirimkan ke Email ({selectedReq.email}) dan WhatsApp ({selectedReq.phone}) pemohon.</p>
              </div>
            ) : (
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="space-y-1 text-xs">
                  <span className="text-muted-foreground">Penerima Notifikasi:</span>
                  <span className="block font-bold text-foreground">{selectedReq.applicantName} ({selectedReq.email})</span>
                  <span className="block text-[11px] text-muted-foreground">No. Tiket: {selectedReq.ticketNo}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Isi Pesan Notifikasi Status</label>
                  <textarea
                    rows={4}
                    required
                    value={notifyMsg}
                    onChange={(e) => setNotifyMsg(e.target.value)}
                    className="w-full p-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:border-[#007144]"
                  />
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${selectedReq.phone.replace(/^0/, "62")}?text=${encodeURIComponent(notifyMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Kirim WA</span>
                  </a>
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#007144] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935]"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Kirim Email</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
