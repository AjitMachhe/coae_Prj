import { useEffect, useState } from "react";
import {
  collection, onSnapshot, query, orderBy, where,
  addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const col = collection(db, "pages");

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Admin: all pages (drafts included)
export function usePages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(col, orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setPages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err.code || err.message);
        setLoading(false);
      }
    );
  }, []);

  return { pages, loading, error };
}

// Public site: published pages only
export function usePublishedPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(col, where("status", "==", "published"));
    return onSnapshot(
      q,
      (snap) => {
        setPages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err.code || err.message);
        setLoading(false);
      }
    );
  }, []);

  return { pages, loading, error };
}

export async function getPublishedPageBySlug(slug) {
  const snap = await getDocs(
    query(col, where("slug", "==", slug), where("status", "==", "published"))
  );
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getPageById(id) {
  const snap = await getDoc(doc(db, "pages", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function slugExists(slug, exceptId) {
  const snap = await getDocs(query(col, where("slug", "==", slug)));
  return snap.docs.some((d) => d.id !== exceptId);
}

export async function savePage(id, data) {
  if (id) {
    await updateDoc(doc(db, "pages", id), { ...data, updatedAt: serverTimestamp() });
    return id;
  }
  const ref = await addDoc(col, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export const deletePage = (id) => deleteDoc(doc(db, "pages", id));