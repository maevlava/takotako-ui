import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Ingredient } from "../../data/ingredients";
import { effectivePar, itemThresholds } from "../../data/warehouse";
import { fieldBoxClass, noSpinner } from "../../lib/ui";

interface LevelSettingsModalProps {
    item: Ingredient;
    onSave: (patch: { parLevel: number; thresholds: { high: number; normal: number; low: number } }) => void;
    onClose: () => void;
}

export default function LevelSettingsModal({ item, onSave, onClose }: LevelSettingsModalProps) {
    const initial = itemThresholds(item);
    const [parLevel, setParLevel] = useState(effectivePar(item));
    const [high, setHigh] = useState(initial.high);
    const [normal, setNormal] = useState(initial.normal);
    const [low, setLow] = useState(initial.low);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const save = () => {
        onSave({ parLevel, thresholds: { high, normal, low } });
        onClose();
    };

    const rows: { label: string; value: number; set: (value: number) => void; hint: string }[] = [
        { label: "Par (target)", value: parLevel, set: setParLevel, hint: "stok ideal maksimum" },
        { label: "High ≥", value: high, set: setHigh, hint: "minimal stok untuk High" },
        { label: "Normal ≥", value: normal, set: setNormal, hint: "minimal stok untuk Normal" },
        { label: "Low ≥", value: low, set: setLow, hint: "minimal stok untuk Low" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-3">
                    <div>
                        <h2 className="font-semibold text-fg">Atur Level · {item.name}</h2>
                        <p className="text-xs text-muted">Ambang batas dalam satuan {item.unit}.</p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-muted transition-colors hover:text-fg">
                        <X size={18} />
                    </button>
                </header>

                <div className="flex flex-col gap-3 p-5">
                    {rows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-fg">{row.label}</p>
                                <p className="text-xs text-faint">{row.hint}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={row.value}
                                    onChange={(event) => row.set(Number(event.target.value))}
                                    className={`${fieldBoxClass} ${noSpinner} w-24 text-right text-sm text-fg`}
                                />
                                <span className="w-10 text-xs text-faint">{item.unit}</span>
                            </div>
                        </div>
                    ))}
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
