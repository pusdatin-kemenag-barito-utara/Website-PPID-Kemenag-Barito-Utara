"use client";

import { useState, useEffect } from "react";
import { StandarLayananData, initialStandarLayananData } from "./standar-layanan-store";

const STANDAR_LAYANAN_STORAGE_KEY = "ppid_standar_layanan_store";

export function useStandarLayananStore() {
  const [data, setData] = useState<StandarLayananData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STANDAR_LAYANAN_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.error("Gagal membaca standar layanan data dari storage:", err);
      }
    }
    return initialStandarLayananData;
  });

  const updateData = (newData: StandarLayananData) => {
    setData(newData);
    try {
      localStorage.setItem(STANDAR_LAYANAN_STORAGE_KEY, JSON.stringify(newData));
      window.dispatchEvent(new Event("standar_layanan_updated"));
    } catch (err) {
      console.error("Gagal menyimpan standar layanan data ke storage:", err);
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(STANDAR_LAYANAN_STORAGE_KEY);
        if (saved) {
          setData(JSON.parse(saved));
        }
      } catch {}
    };

    window.addEventListener("standar_layanan_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("standar_layanan_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return { data, updateData };
}
