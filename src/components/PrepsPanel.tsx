import { useState } from "react";
import { PackagePlus, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { formatRupiah, type Batch } from "../data/ingredients";
import { formatDay } from "../data/orders";
import { allocateOldest, applyReturn, prepCost, reverseAllocations, type Prep, type PrepItem } from "../data/preps";
import { useIngredients } from "../hooks/useIngredients";
import { usePreps } from "../hooks/usePreps";
import PrepModal from "./PrepModal";
import ReturnModal, { type PrepReturn } from "./ReturnModal";

export default function PrepsPanel({
    outletId,
    inRange,
}: {
    outletId: string;
    inRange: (date: string) => boolean;
}) {
    const { items: ingredients, update: updateIngredient } = useIngredients();
    const { preps, add, update, remove } = usePreps();
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Prep | null>(null);
    const [returning, setReturning] = useState<Prep | null>(null);

    const list = preps
        .filter((prep) => prep.outletId === outletId && inRange(prep.date))
        .sort((a, b) => b.date.localeCompare(a.date));

    const currentBatches = (id: string) =>
        ingredients.find((ingredient) => ingredient.id === id)?.batches ?? [];

    const persist = (working: Map<string, Batch[]>) => {
        for (const [id, batches] of working) {
            updateIngredient(id, { batches, stock: batches.reduce((sum, batch) => sum + batch.qty, 0) });
        }
    };

    const create = (data: { date: string; items: PrepItem[] }) => {
        const working = new Map<string, Batch[]>();
        const items: PrepItem[] = data.items.map((item) => {
            const base = working.get(item.ingredientId) ?? [...currentBatches(item.ingredientId)];
            const result = allocateOldest(base, item.qty);
            working.set(item.ingredientId, result.batches);
            return { ...item, returned: 0, allocations: result.allocations };
        });
        persist(working);
        add({ outletId, date: data.date, items });
        setCreating(false);
    };

    const saveEdit = (prep: Prep, data: { date: string; items: PrepItem[] }) => {
        const ids = new Set([
            ...prep.items.map((item) => item.ingredientId),
            ...data.items.map((item) => item.ingredientId),
        ]);
        const working = new Map<string, Batch[]>();
        for (const id of ids) working.set(id, [...currentBatches(id)]);

        for (const item of prep.items) {
            working.set(item.ingredientId, reverseAllocations(item, working.get(item.ingredientId) ?? []));
        }

        const items: PrepItem[] = data.items.map((item) => {
            const result = allocateOldest(working.get(item.ingredientId) ?? [], item.qty);
            working.set(item.ingredientId, result.batches);
            return { ...item, returned: 0, allocations: result.allocations };
        });

        persist(working);
        update(prep.id, { date: data.date, items });
        setEditing(null);
    };

    const applyReturns = (prep: Prep, returns: PrepReturn[]) => {
        const working = new Map<string, Batch[]>();
        const items = prep.items.map((item, index) => {
            const entry = returns.find((candidate) => candidate.index === index);
            if (!entry || entry.qty <= 0) return item;
            const base = working.get(item.ingredientId) ?? [...currentBatches(item.ingredientId)];
            const result = applyReturn(item, entry.qty, base);
            working.set(item.ingredientId, result.batches);
            return result.item;
        });
        persist(working);
        update(prep.id, { items });
        setReturning(null);
    };

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted">{list.length} prep</span>
                <button
                    onClick={() => setCreating(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-green px-3 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                >
                    <PackagePlus size={16} /> Buat Prep
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {list.map((prep) => (
                    <div key={prep.id} className="rounded-xl border border-border bg-bg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-fg">{formatDay(prep.date)}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted">
                                    Biaya {formatRupiah(prepCost(prep, ingredients))}
                                </span>
                                <button
                                    onClick={() => setEditing(prep)}
                                    title="Edit prep"
                                    className="text-muted transition-colors hover:text-lavender"
                                >
                                    <Pencil size={15} />
                                </button>
                                <button
                                    onClick={() => setReturning(prep)}
                                    title="Kembalikan bahan"
                                    className="text-muted transition-colors hover:text-lavender"
                                >
                                    <RotateCcw size={15} />
                                </button>
                                <button
                                    onClick={() => remove(prep.id)}
                                    className="text-muted transition-colors hover:text-red"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {prep.items.map((item) => (
                                <span
                                    key={item.ingredientId}
                                    className="rounded-md bg-surface px-2 py-0.5 text-xs text-muted"
                                >
                                    {item.ingredientName} {item.qty}
                                    {item.unit}
                                    {item.returned > 0 && (
                                        <span className="text-faint">
                                            {" "}
                                            (kembali {item.returned}
                                            {item.unit})
                                        </span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
                {list.length === 0 && <p className="text-sm text-faint">Belum ada prep.</p>}
            </div>

            {creating && (
                <PrepModal ingredients={ingredients} onSave={create} onClose={() => setCreating(false)} />
            )}
            {editing && (
                <PrepModal
                    ingredients={ingredients}
                    initial={editing}
                    onSave={(data) => saveEdit(editing, data)}
                    onClose={() => setEditing(null)}
                />
            )}
            {returning && (
                <ReturnModal
                    prep={returning}
                    ingredients={ingredients}
                    onConfirm={(returns) => applyReturns(returning, returns)}
                    onClose={() => setReturning(null)}
                />
            )}
        </div>
    );
}
