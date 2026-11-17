import { useEffect, useState } from "react";
import {
  collection, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { MENU_DEFAULTS, menuOf } from "./menuStyle";

const col = collection(db, "menuItems");

export function useMenuItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(col, orderBy("order", "asc"));
    return onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err.code || err.message);
        setLoading(false);
      }
    );
  }, []);

  const addItem = (label, menu = "top") => {
    const group = items.filter((i) => menuOf(i) === menu);
    const nextOrder = group.length
      ? Math.max(...group.map((i) => i.order ?? 0)) + 1
      : 0;
    return addDoc(col, {
      label,
      menu,
      order: nextOrder,
      style: MENU_DEFAULTS[menu],
      createdAt: serverTimestamp(),
    });
  };

  const renameItem = (id, label) => updateDoc(doc(db, "menuItems", id), { label });

  const removeItem = async (id) => {
    await deleteDoc(doc(db, "menuItems", id));
    try {
      await deleteDoc(doc(db, "megaMenus", id)); // no-op if there is none
    } catch (err) {
      console.error(err);
    }
  };

  const updateStyle = (id, style) => updateDoc(doc(db, "menuItems", id), { style });
  const updateLink = (id, link) => updateDoc(doc(db, "menuItems", id), { link });

  const moveItem = async (id, dir) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const group = items.filter((i) => menuOf(i) === menuOf(item));
    const idx = group.findIndex((i) => i.id === id);
    const target = idx + dir;
    if (target < 0 || target >= group.length) return;

    const next = [...group];
    [next[idx], next[target]] = [next[target], next[idx]];

    const batch = writeBatch(db);
    next.forEach((it, i) => {
      batch.update(doc(db, "menuItems", it.id), { order: i });
    });
    await batch.commit();
  };

  return {
    items, loading, error,
    addItem, renameItem, removeItem, updateStyle, updateLink, moveItem,
  };
}