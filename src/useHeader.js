import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const ref = doc(db, "settings", "header");

export const DEFAULT_HEADER = {
  siteName: "My Site",
  logo: "",
  logoHeight: 40,
  topLabel: "Our Impact",
  showTopBar: true,
  showSearch: true,
  topBg: "#7a0000",
  mainBg: "#8c1515",
};

export function useHeader() {
  const [header, setHeader] = useState(null); // null until the first read
  const [error, setError] = useState("");

  useEffect(() => {
    return onSnapshot(
      ref,
      (snap) => {
        setHeader({ ...DEFAULT_HEADER, ...(snap.exists() ? snap.data() : {}) });
      },
      (err) => {
        console.error(err);
        setError(err.code || err.message);
        setHeader(DEFAULT_HEADER);
      }
    );
  }, []);

  return { header, error };
}

export const saveHeader = (data) =>
  setDoc(ref, { ...data, updatedAt: serverTimestamp() });