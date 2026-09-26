import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Ingredient } from "../data/ingredients";
import type { Prep } from "../data/preps";
import { fieldBoxClass, noSpinner } from "../lib/ui";

export interface PrepReturn {
    index: number;
    qty: number;
}

interface ReturnModalProps {
    prep: Prep;
    ingredients: Ingredient[];
    onConfirm: (returns: PrepReturn[]) => void;
    onClose: () => void;
}

export default function ReturnModal({ prep, ingredients, onConfirm, onClose }: ReturnModalProps) {
    const [qty, setQty] = useState<Record<number, number>>({});

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const confirm = () => {
        const returns: PrepReturn[] = prep.items
            .map((item, index) => ({ index, qty: Math.min(qty[index] ?? 0, item.qty - item.returned) }))
            .filter((entry) => entry.qty > 0);
        onConfirm(returns);
        onClose();
    };

    const hasReturns = prep.items.some((item, index) => Math.min(qty[index] ?? 0, item.qty - item.returned) > 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-3">
                    <div>
                        <h2 className="font-semibold text-fg">Kembalikan Bahan</h2>
                        <p className="text-xs text-muted">Sisa balik ke batch asalnya (batch yang sama saat diambil).</p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-muted transition-colors hover:text-fg">
                        <X size={18} />
                    </button>
                </header>

                <div className="flex items-center gap-4 border-b border-border px-5 py-2 text-xs uppercase tracking-wide text-faint">
                    <span className="flex-1">Bahan</span>
                    <span className="w-28 text-right">Dikembalikan</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {prep.items.map((item, index) => {
                        const ingredient = ingredients.find((entry) => entry.id === item.ingredientId);
                        const remaining = item.qty - item.returned;
                        return (
                            <div
                                key={item.ingredientId}
                                className="flex items-center gap-4 border-b border-border px-5 py-2.5 last:border-b-0"
                            >
                                <span className="flex-1 text-sm text-fg">
                                    <span className="block truncate">
                                        {ingredient?.emoji} {item.ingredientName}
                                    </span>
                                    <span className="text-xs text-faint">
                                        diambil {item.qty} {item.unit}
                                        {item.returned > 0 && ` · sudah kembali ${item.returned} ${item.unit}`} · sisa{" "}
                                        {remaining} {item.unit}
                                    </span>
                                </span>
                                <input
                                    type="number"
                                    value={qty[index] ?? 0}
                                    onChange={(event) =>
                                        setQty((prev) => ({ ...prev, [index]: Number(event.target.value) }))
                                    }
                                    className={`${fieldBoxClass} ${noSpinner} w-28 text-right text-sm text-fg`}
                                />
                            </div>
                        );
                    })}
                </div>

                <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
                    >
                        Batal
                    </button>
                    <button
                        onClick={confirm}
                        disabled={!hasReturns}
                        className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                        Kembalikan
                    </button>
                </footer>
            </div>
        </div>
    );
}
