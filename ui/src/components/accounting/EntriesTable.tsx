import { useMemo, useState } from "react";
import { Download, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { formatRupiah } from "../../data/ingredients";
import { formatDay } from "../../data/orders";
import { type Entry, type EntryType } from "../../data/accounting";
import { seedOutlets } from "../../data/outlets";
import { accountingTemplate, importAccountingRows } from "../../data/import";
import { downloadCsv } from "../../lib/csv";
import EntryModal from "./EntryModal";
import ImportDialog from "../common/ImportDialog";

interface EntriesTableProps {
    type: EntryType;
    entries: Entry[];
    onAdd: (data: Omit<Entry, "id">) => void;
    onUpdate: (id: string, patch: Partial<Entry>) => void;
    onDelete: (id: string) => void;
    onImport: (items: Entry[], mode: "append" | "replace") => void;
}

const PER_PAGE = 10;

const outletName = (id: string) => seedOutlets.find((outlet) => outlet.id === id)?.name ?? id;
const dateInputClass =
    "rounded-lg border border-border bg-bg px-2 py-2 text-sm text-fg outline-none transition-colors focus:border-lavender";

export default function EntriesTable({ type, entries, onAdd, onUpdate, onDelete, onImport }: EntriesTableProps) {
    const [query, setQuery] = useState("");
    const [outlet, setOutlet] = useState("all");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState<Entry | null>(null);
    const [adding, setAdding] = useState(false);
    const [importing, setImporting] = useState(false);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return entries
            .filter((entry) => entry.type === type)
            .filter((entry) => outlet === "all" || entry.outletId === outlet)
            .filter((entry) => (from === "" ? true : entry.date >= from))
            .filter((entry) => (to === "" ? true : entry.date <= to))
            .filter((entry) =>
                q ? [entry.category, entry.description].some((value) => value.toLowerCase().includes(q)) : true
            )
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [entries, type, query, outlet, from, to]);

    const total = filtered.reduce((sum, entry) => sum + entry.amount, 0);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const current = Math.min(page, totalPages);
    const pageItems = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
    const accent = type === "income" ? "text-green" : "text-red";

    const reset = () => setPage(1);

    const exportCsv = () => {
        const rows: (string | number)[][] = [["Tanggal", "Outlet", "Kategori", "Deskripsi", "Jumlah"]];
        for (const entry of filtered) {
            rows.push([entry.date, outletName(entry.outletId), entry.category, entry.description, entry.amount]);
        }
        downloadCsv(`${type}.csv`, rows);
    };

    const cell = (extra = "") =>
        `border-y border-border bg-bg px-4 py-2.5 align-middle transition-colors group-hover:bg-surface ${extra}`;

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                reset();
                            }}
                            placeholder="Cari kategori / deskripsi..."
                            className="w-56 rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-fg outline-none placeholder:text-faint focus:border-lavender"
                        />
                    </div>
                    <select
                        value={outlet}
                        onChange={(event) => {
                            setOutlet(event.target.value);
                            reset();
                        }}
                        className="cursor-pointer rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-lavender"
                    >
                        <option value="all" className="bg-surface text-fg">
                            Semua outlet
                        </option>
                        {seedOutlets.map((item) => (
                            <option key={item.id} value={item.id} className="bg-surface text-fg">
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={from}
                        onChange={(event) => {
                            setFrom(event.target.value);
                            reset();
                        }}
                        className={dateInputClass}
                    />
                    <span className="text-muted">–</span>
                    <input
                        type="date"
                        value={to}
                        onChange={(event) => {
                            setTo(event.target.value);
                            reset();
                        }}
                        className={dateInputClass}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted">
                        Total <span className={`font-semibold ${accent}`}>{formatRupiah(total)}</span>
                    </span>
                    <button
                        onClick={() => setImporting(true)}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-fg"
                    >
                        <Upload size={15} /> Import
                    </button>
                    <button
                        onClick={exportCsv}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-fg"
                    >
                        <Download size={15} /> CSV
                    </button>
                    <button
                        onClick={() => setAdding(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-green px-3 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                    >
                        <Plus size={16} /> Tambah
                    </button>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2 text-left">
                    <thead>
                        <tr className="text-xs font-semibold uppercase tracking-wide text-faint">
                            <th className="px-4 pb-1">Tanggal</th>
                            <th className="px-4 pb-1">Outlet</th>
                            <th className="px-4 pb-1">Kategori</th>
                            <th className="px-4 pb-1">Deskripsi</th>
                            <th className="px-4 pb-1 text-right">Jumlah</th>
                            <th className="px-4 pb-1" />
                        </tr>
                    </thead>
                    <tbody>
                        {pageItems.map((entry) => (
                            <tr key={entry.id} className="group">
                                <td className={`${cell("rounded-l-xl border-l")} whitespace-nowrap text-muted`}>
                                    {formatDay(entry.date)}
                                </td>
                                <td className={`${cell("")} whitespace-nowrap text-fg`}>{outletName(entry.outletId)}</td>
                                <td className={cell("")}>
                                    <span className="rounded-md bg-surface px-2 py-0.5 text-xs text-muted">
                                        {entry.category}
                                    </span>
                                </td>
                                <td className={`${cell("")} text-muted`}>{entry.description || "-"}</td>
                                <td className={`${cell("")} whitespace-nowrap text-right font-medium ${accent}`}>
                                    {formatRupiah(entry.amount)}
                                </td>
                                <td className={cell("rounded-r-xl border-r")}>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEditing(entry)}
                                            title="Edit"
                                            className="text-muted transition-colors hover:text-lavender"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(entry.id)}
                                            title="Hapus"
                                            className="text-muted transition-colors hover:text-red"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">Tidak ada data.</p>}
            </div>

            <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted">
                    {filtered.length} data · Halaman {current} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(current - 1)}
                        disabled={current <= 1}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg disabled:opacity-40"
                    >
                        Sebelumnya
                    </button>
                    <button
                        onClick={() => setPage(current + 1)}
                        disabled={current >= totalPages}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg disabled:opacity-40"
                    >
                        Berikutnya
                    </button>
                </div>
            </div>

            {adding && <EntryModal type={type} onSave={onAdd} onClose={() => setAdding(false)} />}
            {editing && (
                <EntryModal
                    type={type}
                    initial={editing}
                    onSave={(data) => onUpdate(editing.id, data)}
                    onClose={() => setEditing(null)}
                />
            )}
            {importing && (
                <ImportDialog
                    title="Accounting"
                    hint="Import pendapatan & pengeluaran dari CSV/Excel."
                    template={accountingTemplate}
                    templateName="template-accounting.csv"
                    onImport={(rows, mode) => {
                        const result = importAccountingRows(rows);
                        if (result.items.length > 0) onImport(result.items, mode);
                        return result.errors;
                    }}
                    onClose={() => setImporting(false)}
                />
            )}
        </div>
    );
}
