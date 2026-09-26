import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { formatRupiah } from "../data/ingredients";
import { orderMenus, orderMethods, type Order, type OrderItem, type OrderMethod } from "../data/orders";
import { fieldBoxClass, noSpinner } from "../lib/ui";

interface OrderEditModalProps {
    order: Order;
    onSave: (patch: Partial<Order>) => void;
    onClose: () => void;
}

export default function OrderEditModal({ order, onSave, onClose }: OrderEditModalProps) {
    const [time, setTime] = useState(order.time);
    const [method, setMethod] = useState<OrderMethod>(order.method);
    const [items, setItems] = useState<OrderItem[]>(order.items);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const updateItem = (index: number, patch: Partial<OrderItem>) =>
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

    const addItem = () => {
        const menu = orderMenus[0];
        setItems((prev) => [
            ...prev,
            { menuId: menu.id, menuName: menu.name, qty: 1, price: menu.price },
        ]);
    };

    const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

    const save = () => {
        if (items.length === 0) return;
        onSave({ time, method, items, total });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-3">
                    <div>
                        <h2 className="font-semibold text-fg">Edit Order</h2>
                        <p className="text-xs text-muted">{order.id}</p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-muted transition-colors hover:text-fg">
                        <X size={18} />
                    </button>
                </header>

                <div className="flex flex-col gap-4 overflow-y-auto p-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-wide text-faint">Jam</label>
                            <input
                                type="time"
                                value={time}
                                onChange={(event) => setTime(event.target.value)}
                                className={`${fieldBoxClass} text-sm text-fg`}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-wide text-faint">Metode</label>
                            <select
                                value={method}
                                onChange={(event) => setMethod(event.target.value as OrderMethod)}
                                className={`${fieldBoxClass} cursor-pointer text-sm text-fg`}
                            >
                                {orderMethods.map((option) => (
                                    <option key={option} value={option} className="bg-surface text-fg">
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wide text-faint">Item</span>
                            <button
                                onClick={addItem}
                                className="flex items-center gap-1 rounded-md bg-surface-hover px-2.5 py-1 text-xs font-medium text-fg transition-colors hover:bg-surface"
                            >
                                <Plus size={13} /> Tambah
                            </button>
                        </div>
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2"
                            >
                                <select
                                    value={item.menuId}
                                    onChange={(event) => {
                                        const menu = orderMenus.find((entry) => entry.id === event.target.value);
                                        if (menu) {
                                            updateItem(index, {
                                                menuId: menu.id,
                                                menuName: menu.name,
                                                price: menu.price,
                                            });
                                        }
                                    }}
                                    className={`${fieldBoxClass} flex-1 cursor-pointer text-sm text-fg`}
                                >
                                    {orderMenus.map((menu) => (
                                        <option key={menu.id} value={menu.id} className="bg-surface text-fg">
                                            {menu.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={item.qty}
                                    onChange={(event) => updateItem(index, { qty: Number(event.target.value) })}
                                    className={`${fieldBoxClass} ${noSpinner} w-20 text-right text-sm text-fg`}
                                />
                                <span className="w-24 text-right text-xs text-green">
                                    {formatRupiah(item.qty * item.price)}
                                </span>
                                <button
                                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                                    className="text-muted transition-colors hover:text-red"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {items.length === 0 && <p className="text-sm text-faint">Minimal satu item.</p>}
                    </div>
                </div>

                <footer className="flex items-center justify-between border-t border-border px-5 py-3">
                    <span className="text-sm text-muted">
                        Total: <span className="font-semibold text-green">{formatRupiah(total)}</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
                        >
                            Batal
                        </button>
                        <button
                            onClick={save}
                            disabled={items.length === 0}
                            className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                            Simpan
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
