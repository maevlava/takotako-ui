import { Fragment, useState } from "react";
import { ChevronRight, Download, Pencil, Upload } from "lucide-react";
import { formatRupiah } from "../../data/ingredients";
import { formatDay, type Order } from "../../data/orders";
import { importOrderRows, orderTemplate } from "../../data/import";
import { downloadCsv } from "../../lib/csv";
import { columnDivider } from "../../lib/ui";
import ImportDialog from "../common/ImportDialog";

interface OrdersTableProps {
    orders: Order[];
    onEdit: (order: Order) => void;
    onImport: (items: Order[], mode: "append" | "replace") => void;
}

const PER_PAGE = 10;

export default function OrdersTable({ orders, onEdit, onImport }: OrdersTableProps) {
    const [page, setPage] = useState(1);
    const [openId, setOpenId] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);

    const sorted = [...orders].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
    const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
    const current = Math.min(page, totalPages);
    const pageItems = sorted.slice((current - 1) * PER_PAGE, current * PER_PAGE);

    const exportCsv = () => {
        const rows: (string | number)[][] = [
            ["Order ID", "Tanggal", "Jam", "Item", "Total", "Metode", "Usia", "Gender", "Area", "Tipe"],
        ];
        for (const order of sorted) {
            rows.push([
                order.id,
                formatDay(order.date),
                order.time,
                order.items.map((item) => `${item.menuName} x${item.qty}`).join("; "),
                order.total,
                order.method,
                order.age,
                order.gender,
                order.area,
                order.repeat ? "Repeat" : "Baru",
            ]);
        }
        downloadCsv("orders.csv", rows);
    };

    const cell = (extra = "") =>
        `border-y border-border bg-bg px-4 py-2.5 align-middle transition-colors group-hover:bg-surface ${extra}`;

    return (
        <div>
            <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm text-muted">{sorted.length} order</span>
                <div className="flex items-center gap-2">
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
                        <Download size={15} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2 text-left">
                    <thead>
                        <tr className="text-xs font-semibold uppercase tracking-wide text-faint">
                            <th className="px-4 pb-1">Order ID</th>
                            <th className="px-4 pb-1">Tanggal</th>
                            <th className="px-4 pb-1">Jam</th>
                            <th className="px-4 pb-1">Item</th>
                            <th className="px-4 pb-1">Total</th>
                            <th className="px-4 pb-1">Metode</th>
                            <th className="px-4 pb-1" />
                        </tr>
                    </thead>
                    <tbody>
                        {pageItems.map((order) => {
                            const isOpen = openId === order.id;
                            const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
                            return (
                                <Fragment key={order.id}>
                                    <tr
                                        className="group cursor-pointer"
                                        onClick={() => setOpenId(isOpen ? null : order.id)}
                                    >
                                        <td className={cell("rounded-l-xl border-l")}>
                                            <div className="flex items-center gap-2">
                                                <ChevronRight
                                                    size={15}
                                                    className={`text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}
                                                />
                                                <span className="font-medium text-fg">{order.id}</span>
                                            </div>
                                        </td>
                                        <td className={`${cell(columnDivider)} whitespace-nowrap text-muted`}>
                                            {formatDay(order.date)}
                                        </td>
                                        <td className={`${cell(columnDivider)} text-muted`}>{order.time}</td>
                                        <td className={`${cell(columnDivider)} text-muted`}>{itemCount} item</td>
                                        <td className={`${cell(columnDivider)} whitespace-nowrap font-medium text-fg`}>
                                            {formatRupiah(order.total)}
                                        </td>
                                        <td className={`${cell(columnDivider)} text-muted`}>{order.method}</td>
                                        <td className={cell("rounded-r-xl border-r")}>
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onEdit(order);
                                                }}
                                                title="Edit order"
                                                className="text-muted transition-colors hover:text-lavender"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                    {isOpen && (
                                        <tr>
                                            <td colSpan={7} className="rounded-xl border border-border bg-bg px-5 py-4">
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <p className="mb-2 text-xs uppercase tracking-wide text-faint">
                                                            Rincian item
                                                        </p>
                                                        <div className="flex flex-col gap-1.5">
                                                            {order.items.map((item) => (
                                                                <div
                                                                    key={item.menuId}
                                                                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                                                                >
                                                                    <span className="text-fg">
                                                                        {item.menuName}{" "}
                                                                        <span className="text-muted">× {item.qty}</span>
                                                                    </span>
                                                                    <span className="font-medium text-fg">
                                                                        {formatRupiah(item.qty * item.price)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="mb-2 text-xs uppercase tracking-wide text-faint">
                                                            Pelanggan
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <Detail label="Usia" value={order.age} />
                                                            <Detail label="Gender" value={order.gender} />
                                                            <Detail label="Area" value={order.area} />
                                                            <Detail
                                                                label="Tipe"
                                                                value={order.repeat ? "Repeat" : "Baru"}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
                {sorted.length === 0 && <p className="py-8 text-center text-sm text-muted">Tidak ada order.</p>}
            </div>

            <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted">
                    Halaman {current} / {totalPages}
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

            {importing && (
                <ImportDialog
                    title="Orders"
                    hint="Import order dari CSV/Excel. Beberapa baris dengan orderId sama = satu order."
                    template={orderTemplate}
                    templateName="template-orders.csv"
                    onImport={(rows, mode) => {
                        const result = importOrderRows(rows);
                        if (result.items.length > 0) onImport(result.items, mode);
                        return result.errors;
                    }}
                    onClose={() => setImporting(false)}
                />
            )}
        </div>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-surface px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-faint">{label}</p>
            <p className="text-fg">{value}</p>
        </div>
    );
}
