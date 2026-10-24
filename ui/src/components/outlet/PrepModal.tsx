import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { formatRupiah, lineCost, totalStock, type Ingredient } from "../../data/ingredients";
import type { Prep, PrepItem } from "../../data/preps";
import { fieldBoxClass, noSpinner } from "../../lib/ui";

interface PrepModalProps {
    ingredients: Ingredient[];
    initial?: Prep;
    onSave: (data: { date: string; items: PrepItem[] }) => void;
    onClose: () => void;
}

const today = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export default function PrepModal({ ingredients, initial, onSave, onClose }: PrepModalProps) {
    const [date, setDate] = useState(initial?.date ?? today());
    const [items, setItems] = useState<PrepItem[]>(initial?.items ?? []);
    const [pick, setPick] = useState(ingredients[0]?.id ?? "");
    const [qty, setQty] = useState(1);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const selected = ingredients.find((ingredient) => ingredient.id === pick);
    const unitOptions = useMemo(
        () => (selected ? Array.from(new Set([selected.unit, "g", "kg", "ml", "l", "pcs"])) : []),
        [selected]
    );
    const [unit, setUnit] = useState(selected?.unit ?? "pcs");

    const total = items.reduce((sum, item) => {
        const ingredient = ingredients.find((entry) => entry.id === item.ingredientId);
        return ingredient ? sum + lineCost(ingredient, item.qty, item.unit) : sum;
    }, 0);

    const addItem = () => {
        if (!selected) return;
        setItems((prev) => {
            const existing = prev.find((item) => item.ingredientId === selected.id);
            if (existing) {
                return prev.map((item) =>
                    item.ingredientId === selected.id ? { ...item, qty: item.qty + qty } : item
                );
            }
            return [
                ...prev,
                {
                    ingredientId: selected.id,
                    ingredientName: selected.name,
                    qty,
                    unit,
                    returned: 0,
                    allocations: [],
                },
            ];
        });
    };

    const updateItem = (index: number, patch: Partial<PrepItem>) =>
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-3">
                    <div>
                        <h2 className="font-semibold text-fg">Buat Prep</h2>
                        <p className="text-xs text-muted">Stok warehouse otomatis dikurangi dari batch terlama.</p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-muted transition-colors hover:text-fg">
                        <X size={18} />
                    </button>
                </header>

                <div className="flex flex-col gap-4 overflow-y-auto p-5">
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-muted">Tanggal</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(event) => setDate(event.target.value)}
                            className={`${fieldBoxClass} text-sm text-fg`}
                        />
                    </div>

                    <div className="rounded-xl border border-border bg-bg p-4">
                        <p className="mb-3 text-xs uppercase tracking-wide text-faint">Tambah bahan</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={pick}
                                onChange={(event) => {
                                    setPick(event.target.value);
                                    const next = ingredients.find((entry) => entry.id === event.target.value);
                                    if (next) setUnit(next.unit);
                                }}
                                className={`${fieldBoxClass} cursor-pointer text-sm text-fg`}
                            >
                                {ingredients.map((ingredient) => (
                                    <option key={ingredient.id} value={ingredient.id} className="bg-surface text-fg">
                                        {ingredient.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={qty}
                                onChange={(event) => setQty(Number(event.target.value))}
                                className={`${fieldBoxClass} ${noSpinner} w-24 text-right text-sm text-fg`}
                            />
                            <select
                                value={unit}
                                onChange={(event) => setUnit(event.target.value)}
                                className={`${fieldBoxClass} w-24 cursor-pointer text-sm text-fg`}
                            >
                                {unitOptions.map((option) => (
                                    <option key={option} value={option} className="bg-surface text-fg">
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={addItem}
                                className="flex items-center gap-1.5 rounded-lg bg-green px-3 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                            >
                                <Plus size={15} /> Tambah
                            </button>
                        </div>
                        {selected && (
                            <p className="mt-3 text-xs text-muted">
                                Stok {selected.name}:{" "}
                                <span className="text-fg">
                                    {totalStock(selected)} {selected.unit}
                                </span>{" "}
                                · {selected.batches?.length ?? 0} batch
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {items.map((item, index) => {
                            const ingredient = ingredients.find((entry) => entry.id === item.ingredientId);
                            return (
                                <div
                                    key={item.ingredientId}
                                    className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2"
                                >
                                    <span className="flex-1 truncate text-sm text-fg">
                                        {ingredient?.emoji} {item.ingredientName}
                                    </span>
                                    {ingredient && item.qty > totalStock(ingredient) && (
                                        <span className="text-xs text-red" title="Melebihi stok tersedia">
                                            stok {totalStock(ingredient)} {ingredient.unit}
                                        </span>
                                    )}
                                    <input
                                        type="number"
                                        value={item.qty}
                                        onChange={(event) => updateItem(index, { qty: Number(event.target.value) })}
                                        className={`${fieldBoxClass} ${noSpinner} w-20 text-right text-sm text-fg`}
                                    />
                                    <span className="w-10 text-xs text-faint">{item.unit}</span>
                                    <span className="w-24 text-right text-xs text-green">
                                        {formatRupiah(ingredient ? lineCost(ingredient, item.qty, item.unit) : 0)}
                                    </span>
                                    <button
                                        onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                                        className="text-muted transition-colors hover:text-red"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })}
                        {items.length === 0 && (
                            <p className="text-sm text-faint">Belum ada bahan dipilih.</p>
                        )}
                    </div>
                </div>

                <footer className="flex items-center justify-between border-t border-border px-5 py-3">
                    <span className="text-sm text-muted">
                        Biaya bahan: <span className="font-semibold text-green">{formatRupiah(total)}</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => items.length > 0 && onSave({ date, items })}
                            disabled={items.length === 0}
                            className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                            Simpan Prep
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
