import { useEffect, useState } from "react";
import { makeBatch, newIngredient, seedIngredients, type Ingredient } from "../data/ingredients";

const STORAGE_KEY = "tako.ingredients";

const load = (): Ingredient[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedIngredients;
    try {
        const stored = JSON.parse(raw) as Ingredient[];
        return stored.map((item) => {
            const seed = seedIngredients.find(
                (entry) => entry.id === item.id || entry.name.toLowerCase() === item.name.toLowerCase()
            );
            const batches =
                item.batches && item.batches.length > 0
                    ? item.batches.map((batch) => ({
                          ...batch,
                          addedAt: batch.addedAt ?? new Date().toISOString(),
                      }))
                    : [makeBatch(item.stock, item.expiryDays ?? 7)];
            return {
                ...item,
                batches,
                parLevel: item.parLevel ?? seed?.parLevel,
                dailyUsage: item.dailyUsage ?? seed?.dailyUsage,
            };
        });
    } catch {
        return seedIngredients;
    }
};

export function useIngredients() {
    const [items, setItems] = useState<Ingredient[]>(load);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const update = (id: string, patch: Partial<Ingredient>) =>
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

    const add = () => setItems((prev) => [...prev, newIngredient()]);
    const remove = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));

    return { items, update, add, remove };
}
