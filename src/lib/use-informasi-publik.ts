"use client";

import { useState, useEffect } from "react";
import { InformasiPublikDoc, initialInformasiPublikDocs } from "./informasi-publik-store";

const INFORMASI_PUBLIK_STORAGE_KEY = "ppid_informasi_publik_docs_store";

export function useInformasiPublikStore() {
  const [docs, setDocs] = useState<InformasiPublikDoc[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(INFORMASI_PUBLIK_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.error("Gagal membaca dokumen informasi publik dari storage:", err);
      }
    }
    return initialInformasiPublikDocs;
  });

  const updateDocs = (newDocs: InformasiPublikDoc[]) => {
    setDocs(newDocs);
    try {
      localStorage.setItem(INFORMASI_PUBLIK_STORAGE_KEY, JSON.stringify(newDocs));
      window.dispatchEvent(new Event("informasi_publik_updated"));
    } catch (err) {
      console.error("Gagal menyimpan dokumen informasi publik ke storage:", err);
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(INFORMASI_PUBLIK_STORAGE_KEY);
        if (saved) {
          setDocs(JSON.parse(saved));
        }
      } catch {}
    };

    window.addEventListener("informasi_publik_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("informasi_publik_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return { docs, updateDocs };
}
