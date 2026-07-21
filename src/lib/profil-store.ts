"use client";

import { useState, useEffect } from "react";
import { ProfilData, initialProfilData } from "./profil-data";

const PROFIL_STORAGE_KEY = "ppid_profil_data_store";

export function useProfilStore() {
  const [data, setData] = useState<ProfilData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(PROFIL_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.error("Gagal membaca profil data dari storage:", err);
      }
    }
    return initialProfilData;
  });
  const isLoaded = true;

  const updateData = (newData: ProfilData) => {
    setData(newData);
    try {
      localStorage.setItem(PROFIL_STORAGE_KEY, JSON.stringify(newData));
      window.dispatchEvent(new Event("profil_data_updated"));
    } catch (err) {
      console.error("Gagal menyimpan profil data ke storage:", err);
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(PROFIL_STORAGE_KEY);
        if (saved) {
          setData(JSON.parse(saved));
        }
      } catch {
        // empty catch
      }
    };

    window.addEventListener("profil_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("profil_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return { data, updateData, isLoaded };
}
