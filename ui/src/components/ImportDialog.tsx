import { useMemo, useState } from "react";
import { Download, Upload, X } from "lucide-react";
import { downloadCsv, parseCsv, toObjects } from "../lib/csv";
import { fieldBoxClass } from "../lib/ui";

interface ImportDialogProps {
    title: string;
    hint: string;
    template: (string | number)[][];
    templateName: string;
    onImport: (rows: Record<string, string>[], mode: "append" | "replace") => string[];
    onClose: () => void;
}

export default function ImportDialog({
    title,
    hint,
    template,
    templateName,
    onImport,
    onClose,
}: ImportDialogProps) {
    const [text, setText] = useState("");
    const [mode, setMode] = useState<"append" | "replace">("append");
    const [errors, setErrors] = useState<string[]>([]);

    const rows = useMemo(() => parseCsv(text), [text]);
    const objects = useMemo(() => toObjects(rows), [rows]);
    const header = rows[0] ?? [];
    const preview = rows.slice(1, 6);

    const handleFile = (file: File | undefined) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setText(String(reader.result ?? ""));
            setErrors([]);
        };
        reader.readAsText(file);
    };

    const run = () => {
        if (objects.length === 0) {
            setErrors(["Tidak ada baris data yang terbaca."]);
            return;
        }
        const result = onImport(objects, mode);
        if (result.length > 0) {
            setErrors(result);
            return;
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-3">
                    <div>
                        <h2 className="font-semibold text-fg">Import {title}</h2>
                        <p className="text-xs text-muted">{hint}</p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-muted transition-colors hover:text-fg">
                        <X size={18} />
                    </button>
                </header>

                <div className="flex flex-col gap-4 overflow-y-auto p-5">
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-fg">
                            <Upload size={15} /> Pilih file CSV
                            <input
                                type="file"
                                accept=".csv,.txt,text/csv"
                                className="hidden"
                                onChange={(event) => handleFile(event.target.files?.[0])}
                            />
                        </label>
                        <button
                            onClick={() => downloadCsv(templateName, template)}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-fg"
                        >
                            <Download size={15} /> Download template
                        </button>
                        <span className="text-xs text-faint">
                            Kolom: {template[0].map((cell) => String(cell)).join(", ")}
                        </span>
                    </div>

                    <textarea
                        value={text}
                        onChange={(event) => {
                            setText(event.target.value);
                            setErrors([]);
                        }}
                        placeholder="Atau paste isi CSV/Excel di sini..."
                        rows={6}
                        className={`${fieldBoxClass} font-mono text-xs text-fg`}
                    />

                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wide text-faint">Mode</span>
                        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg p-1">
                            {(["append", "replace"] as const).map((item) => (
                                <button
                                    key={item}
                                    onClick={() => setMode(item)}
                                    className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                                        mode === item ? "bg-surface-hover text-lavender" : "text-muted hover:text-fg"
                                    }`}
                                >
                                    {item === "append" ? "Tambah" : "Ganti semua"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {preview.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-bg text-faint">
                                    <tr>
                                        {header.map((cell, index) => (
                                            <th key={index} className="px-3 py-2 font-medium">
                                                {cell}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row, rowIndex) => (
                                        <tr key={rowIndex} className="border-t border-border">
                                            {header.map((_, cellIndex) => (
                                                <td key={cellIndex} className="px-3 py-1.5 text-muted">
                                                    {row[cellIndex] ?? ""}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {objects.length > 0 && (
                        <p className="text-xs text-muted">{objects.length} baris data terbaca.</p>
                    )}

                    {errors.length > 0 && (
                        <div className="rounded-lg border border-red/40 bg-red/5 p-3">
                            <p className="mb-1 text-xs font-medium text-red">Gagal import:</p>
                            <ul className="list-inside list-disc text-xs text-red">
                                {errors.slice(0, 8).map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                            {errors.length > 8 && (
                                <p className="mt-1 text-xs text-red">+{errors.length - 8} error lain.</p>
                            )}
                        </div>
                    )}
                </div>

                <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
                    >
                        Batal
                    </button>
                    <button
                        onClick={run}
                        disabled={objects.length === 0}
                        className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                        Import {objects.length > 0 ? `(${objects.length})` : ""}
                    </button>
                </footer>
            </div>
        </div>
    );
}
