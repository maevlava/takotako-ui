import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { totalStock, type Ingredient } from "../../data/ingredients";
import { effectivePar, levelMeta, stockLevel } from "../../data/warehouse";
import { fieldBoxClass, noSpinner } from "../../lib/ui";

export interface RestockUpdate {
    id: string;
    qty: number;
    expiryDays: number;
}

interface RestockModalProps {
    ingredients: Ingredient[];
    onConfirm: (updates: RestockUpdate[]) => void;
    onClose: () => void;
}

export default function RestockModal({ ingredients, onConfirm, onClose }: RestockModalProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [qty, setQty] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        for (const item of ingredients) initial[item.id] = Math.max(effectivePar(item) - totalStock(item), 1);
        return initial;
    });
    const [expiry, setExpiry] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        for (const item of ingredients) initial[item.id] = 7;
        return initial;
    });

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });

    const allSelected = ingredients.length > 0 && selected.size === ingredients.length;
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(ingredients.map((item) => item.id)));

    const confirm = () => {
        onConfirm(
            ingredients
                .filter((item) => selected.has(item.id))
                .map((item) => ({ id: item.id, qty: qty[item.id] ?? 1, expiryDays: expiry[item.id] ?? 7 }))
        );
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-3">
                    <div>
                        <h2 className="font-semibold text-fg">Restock</h2>
                        <p className="text-xs text-muted">Batch baru ditambahkan terpisah, expiry-nya sendiri.</p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-muted transition-colors hover:text-fg">
                        <X size={18} />
                    </button>
                </header>

                <div className="flex items-center gap-4 border-b border-border px-5 py-2 text-xs uppercase tracking-wide text-faint">
                    <button onClick={toggleAll} className="transition-colors hover:text-fg">
                        {allSelected ? "Batal pilih" : "Pilih semua"}
                    </button>
                    <span className="ml-auto">Jumlah</span>
                    <span className="w-24 text-right">Expiry (hari)</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {ingredients.map((item) => {
                        const level = stockLevel(item);
                        const meta = levelMeta[level];
                        const checked = selected.has(item.id);
                        return (
                            <div
                                key={item.id}
                                className={`flex items-center gap-4 border-b border-border px-5 py-2.5 transition-colors last:border-b-0 ${
                                    checked ? "bg-bg" : ""
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(item.id)}
                                    className="flex flex-1 items-center gap-3 text-left"
                                >
                                    <span
                                        className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                                            checked ? "border-lavender bg-lavender text-bg" : "border-border"
                                        }`}
                                    >
                                        {checked && <Check size={13} />}
                                    </span>
                                    <span>{item.emoji}</span>
                                    <span className="flex-1 truncate text-sm text-fg">{item.name}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-xs ${meta.bg} ${meta.text}`}>
                                        {meta.label}
                                    </span>
                                </button>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={qty[item.id] ?? 1}
                                        onChange={(event) =>
                                            setQty((prev) => ({ ...prev, [item.id]: Number(event.target.value) }))
                                        }
                                        className={`${fieldBoxClass} ${noSpinner} w-20 px-2 py-1 text-right text-sm text-fg`}
                                    />
                                    <span className="w-10 text-xs text-faint">{item.unit}</span>
                                </div>
                                <input
                                    type="number"
                                    value={expiry[item.id] ?? 7}
                                    onChange={(event) =>
                                        setExpiry((prev) => ({ ...prev, [item.id]: Number(event.target.value) }))
                                    }
                                    className={`${fieldBoxClass} ${noSpinner} w-24 px-2 py-1 text-right text-sm text-fg`}
                                />
                            </div>
                        );
                    })}
                </div>

                <footer className="flex items-center justify-between border-t border-border px-5 py-3">
                    <span className="text-sm text-muted">{selected.size} dipilih</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
                        >
                            Batal
                        </button>
                        <button
                            onClick={confirm}
                            disabled={selected.size === 0}
                            className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                            Restock
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
