import { useEffect, useState } from "react";
import { makePrepId, seedPreps, type Prep } from "../data/preps";

const STORAGE_KEY = "tako.preps";

const load = (): Prep[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedPreps;
    try {
        const stored = JSON.parse(raw) as Prep[];
        return stored.map((prep) => ({
            ...prep,
            items: prep.items.map((item) => ({
                ...item,
                returned: item.returned ?? 0,
                allocations: item.allocations ?? [],
            })),
        }));
    } catch {
        return seedPreps;
    }
};

export function usePreps() {
    const [preps, setPreps] = useState<Prep[]>(load);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preps));
    }, [preps]);

    const add = (prep: Omit<Prep, "id" | "createdAt">) =>
        setPreps((prev) => [...prev, { ...prep, id: makePrepId(), createdAt: new Date().toISOString() }]);
    const update = (id: string, patch: Partial<Prep>) =>
        setPreps((prev) => prev.map((prep) => (prep.id === id ? { ...prep, ...patch } : prep)));
    const remove = (id: string) => setPreps((prev) => prev.filter((prep) => prep.id !== id));

    return { preps, add, update, remove };
}
