import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { categoriesFor, type Entry, type EntryType, typeLabel } from "../data/accounting";
import { seedOutlets } from "../data/outlets";
import { fieldBoxClass, noSpinner } from "../lib/ui";

interface EntryModalProps {
    type: EntryType;
    initial?: Entry;
    onSave: (data: Omit<Entry, "id">) => void;
    onClose: () => void;
}

const today = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export default function EntryModal({ type, initial, onSave, onClose }: EntryModalProps) {
    const categories = categoriesFor(type);
    const [date, setDate] = useState(initial?.date ?? today());
    const [outletId, setOutletId] = useState(initial?.outletId ?? seedOutlets[0]?.id ?? "");
    const [category, setCategory] = useState(initial?.category ?? categories[0]);
    const [description, setDescription] = useState(initial?.description ?? "");
    const [amount, setAmount] = useState(initial?.amount ?? 0);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const save = () => {
        onSave({ type, date, outletId, category, description: description.trim(), amount });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-3">
                    <h2 className="font-semibold text-fg">
                        {initial ? "Edit" : "Tambah"} {typeLabel(type)}
                    </h2>
                    <button onClick={onClose} className="rounded-md p-1 text-muted transition-colors hover:text-fg">
                        <X size={18} />
                    </button>
                </header>

                <div className="flex flex-col gap-4 p-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-wide text-faint">Tanggal</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                className={`${fieldBoxClass} text-sm text-fg`}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-wide text-faint">Outlet</label>
                            <select
                                value={outletId}
                                onChange={(event) => setOutletId(event.target.value)}
                                className={`${fieldBoxClass} cursor-pointer text-sm text-fg`}
                            >
                                {seedOutlets.map((outlet) => (
                                    <option key={outlet.id} value={outlet.id} className="bg-surface text-fg">
                                        {outlet.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-faint">Kategori</label>
                        <select
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            className={`${fieldBoxClass} cursor-pointer text-sm text-fg`}
                        >
                            {categories.map((item) => (
                                <option key={item} value={item} className="bg-surface text-fg">
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-faint">Deskripsi</label>
                        <input
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Keterangan"
                            className={`${fieldBoxClass} text-sm text-fg`}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-faint">Jumlah (Rp)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(event) => setAmount(Number(event.target.value))}
                            className={`${fieldBoxClass} ${noSpinner} text-right text-sm text-fg`}
                        />
                    </div>
                </div>

                <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
                    >
                        Batal
                    </button>
                    <button
                        onClick={save}
                        className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                    >
                        Simpan
                    </button>
                </footer>
            </div>
        </div>
    );
}
