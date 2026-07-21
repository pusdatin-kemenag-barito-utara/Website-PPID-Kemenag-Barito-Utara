"use client";

import { useState, useEffect } from "react";
import { DataInformasiStoreData, initialDataInformasi } from "./data-informasi-store";

const DATA_INFORMASI_STORAGE_KEY = "ppid_data_informasi_store";

export function useDataInformasiStore() {
  const [data, setData] = useState<DataInformasiStoreData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(DATA_INFORMASI_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.error("Gagal membaca data informasi dari storage:", err);
      }
    }
    return initialDataInformasi;
  });

  const updateData = (newData: DataInformasiStoreData) => {
    setData(newData);
    try {
      localStorage.setItem(DATA_INFORMASI_STORAGE_KEY, JSON.stringify(newData));
      window.dispatchEvent(new Event("data_informasi_updated"));
    } catch (err) {
      console.error("Gagal menyimpan data informasi ke storage:", err);
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(DATA_INFORMASI_STORAGE_KEY);
        if (saved) {
          setData(JSON.parse(saved));
        }
      } catch {}
    };

    window.addEventListener("data_informasi_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("data_informasi_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return { data, updateData };
}
