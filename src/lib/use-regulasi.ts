"use client";

import { useState, useEffect } from "react";
import { RegulasiItem, initialRegulasiList } from "./regulasi-store";

const REGULASI_STORAGE_KEY = "ppid_regulasi_data_store";

export function useRegulasiStore() {
  const [items, setItems] = useState<RegulasiItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(REGULASI_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.error("Gagal membaca regulasi dari storage:", err);
      }
    }
    return initialRegulasiList;
  });

  const updateItems = (newItems: RegulasiItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(REGULASI_STORAGE_KEY, JSON.stringify(newItems));
      window.dispatchEvent(new Event("regulasi_updated"));
    } catch (err) {
      console.error("Gagal menyimpan regulasi ke storage:", err);
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(REGULASI_STORAGE_KEY);
        if (saved) {
          setItems(JSON.parse(saved));
        }
      } catch {}
    };

    window.addEventListener("regulasi_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("regulasi_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return { items, updateItems };
}
