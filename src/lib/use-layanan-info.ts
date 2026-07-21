"use client";

import { useState, useEffect } from "react";
import { LayananInfoData, initialLayananInfoData } from "./layanan-info-store";

const LAYANAN_INFO_STORAGE_KEY = "ppid_layanan_info_data_store";

export function useLayananInfoStore() {
  const [data, setData] = useState<LayananInfoData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(LAYANAN_INFO_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.error("Gagal membaca layanan info data dari storage:", err);
      }
    }
    return initialLayananInfoData;
  });

  const updateData = (newData: LayananInfoData) => {
    setData(newData);
    try {
      localStorage.setItem(LAYANAN_INFO_STORAGE_KEY, JSON.stringify(newData));
      window.dispatchEvent(new Event("layanan_info_updated"));
    } catch (err) {
      console.error("Gagal menyimpan layanan info data ke storage:", err);
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(LAYANAN_INFO_STORAGE_KEY);
        if (saved) {
          setData(JSON.parse(saved));
        }
      } catch {}
    };

    window.addEventListener("layanan_info_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("layanan_info_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return { data, updateData };
}
