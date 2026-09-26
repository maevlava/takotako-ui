import { useEffect, useState } from "react";
import { seedEntries, type Entry } from "../data/accounting";

const STORAGE_KEY = "tako.accounting";

const load = (): Entry[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedEntries;
    try {
        return JSON.parse(raw) as Entry[];
    } catch {
        return seedEntries;
    }
};

export function useAccounting() {
    const [entries, setEntries] = useState<Entry[]>(load);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }, [entries]);

    const add = (entry: Omit<Entry, "id">) =>
        setEntries((prev) => [...prev, { ...entry, id: Math.random().toString(36).slice(2, 10) }]);
    const update = (id: string, patch: Partial<Entry>) =>
        setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
    const remove = (id: string) => setEntries((prev) => prev.filter((entry) => entry.id !== id));

    return { entries, add, update, remove };
}
