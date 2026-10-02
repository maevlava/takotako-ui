import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Canvas } from "../components/Canvas";
import ProportionBar from "../components/ProportionBar";
import ProfitByMenu from "../components/ProfitByMenu";
import OrdersTable from "../components/OrdersTable";
import OrderEditModal from "../components/OrderEditModal";
import PrepsPanel from "../components/PrepsPanel";
import { useOrders } from "../hooks/useOrders";
import { useMenus } from "../hooks/useMenus";
import { useIngredients } from "../hooks/useIngredients";
import { isImage } from "../data/ingredients";
import { demographics, ordersByHour, ordersByMenu, type Order } from "../data/orders";
import type { Outlet } from "../data/outlets";

function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-border bg-bg p-5 ${className}`}>
            <p className="mb-4 text-xs uppercase tracking-wide text-faint">{title}</p>
            {children}
        </div>
    );
}

const dateInputClass =
    "rounded-md border border-border bg-bg px-2 py-1 text-sm text-fg outline-none transition-colors focus:border-lavender";

export default function OutletDetail({ outlet, onBack }: { outlet: Outlet; onBack: () => void }) {
    const { orders, update, append, replaceAll } = useOrders();
    const { menus } = useMenus();
    const { items: ingredients } = useIngredients();
    const [mode, setMode] = useState<"all" | "range">("range");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [hour, setHour] = useState<number | "all">("all");
    const [editing, setEditing] = useState<Order | null>(null);

    const outletOrders = useMemo(
        () => orders.filter((order) => order.outletId === outlet.id),
        [orders, outlet.id]
    );

    const sortedDates = useMemo(
        () => [...new Set(outletOrders.map((order) => order.date))].sort((a, b) => b.localeCompare(a)),
        [outletOrders]
    );
    const latest = sortedDates[0] ?? "";
    const rangeFrom = from || latest;
    const rangeTo = to || latest;

    const inRange = (date: string) => mode === "all" || (date >= rangeFrom && date <= rangeTo);
    const filtered = outletOrders.filter((order) => inRange(order.date));
    const scoped = hour === "all" ? filtered : filtered.filter((order) => Number(order.time.slice(0, 2)) === hour);

    const byMenu = ordersByMenu(scoped);
    const hours = ordersByHour(filtered);
    const filterKey = `${mode}:${rangeFrom}:${rangeTo}:${hour}`;

    const chip = (active: boolean) =>
        `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            active ? "bg-surface-hover text-lavender" : "text-muted hover:text-fg"
        }`;

    return (
        <Canvas>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <button
                        onClick={onBack}
                        title="Kembali ke semua outlet"
                        className="mt-0.5 rounded-lg border border-border p-2 text-muted transition-colors hover:text-fg"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-fg">{outlet.name}</h2>
                        <p className="text-sm text-muted">{outlet.address}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-bg p-1">
                    <button onClick={() => setMode("all")} className={chip(mode === "all")}>
                        Semua
                    </button>
                    <div className="flex items-center gap-1 px-1">
                        <input
                            type="date"
                            value={rangeFrom}
                            onChange={(event) => {
                                setFrom(event.target.value);
                                setMode("range");
                            }}
                            className={dateInputClass}
                        />
                        <span className="text-muted">–</span>
                        <input
                            type="date"
                            value={rangeTo}
                            onChange={(event) => {
                                setTo(event.target.value);
                                setMode("range");
                            }}
                            className={dateInputClass}
                        />
                    </div>
                </div>
            </div>

            <Panel title="Orders per jam" className="mt-5">
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setHour("all")} className={chip(hour === "all")}>
                        Semua jam
                    </button>
                    {hours.map((item) => (
                        <button key={item.hour} onClick={() => setHour(item.hour)} className={chip(hour === item.hour)}>
                            {item.label} · {item.value}
                        </button>
                    ))}
                </div>
                {hours.length === 0 && <p className="mt-2 text-sm text-faint">Belum ada data.</p>}
            </Panel>

            <Panel title="Preps" className="mt-4">
                <PrepsPanel outletId={outlet.id} inRange={inRange} />
            </Panel>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <Panel title="Orders per menu">
                    <div className="grid grid-cols-2 gap-2">
                        {byMenu.map((item) => {
                            const menu = menus.find((candidate) => candidate.id === item.id);
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5"
                                >
                                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-border bg-bg text-lg">
                                        {menu && isImage(menu.image) ? (
                                            <img src={menu.image} alt="" className="size-full object-cover" />
                                        ) : (
                                            (menu?.image ?? "🍽️")
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs text-muted">{item.label}</p>
                                        <p className="mt-0.5 text-lg font-semibold text-green">
                                            {item.value}
                                            <span className="ml-1 text-xs text-faint">pcs</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {byMenu.length === 0 && <p className="text-sm text-faint">Belum ada data.</p>}
                </Panel>

                <Panel title="Demografi">
                    <div className="grid gap-5">
                        <div>
                            <p className="mb-2 text-xs text-muted">Kelompok usia</p>
                            <ProportionBar items={demographics(scoped, "age")} />
                        </div>
                        <div>
                            <p className="mb-2 text-xs text-muted">Jenis kelamin</p>
                            <ProportionBar items={demographics(scoped, "gender")} />
                        </div>
                    </div>
                </Panel>
            </div>

            <Panel title="Menu Paling Profit" className="mt-4">
                <ProfitByMenu orders={scoped} menus={menus} ingredients={ingredients} />
            </Panel>

            <Panel title="Daftar Order" className="mt-4">
                <OrdersTable
                    key={filterKey}
                    orders={scoped}
                    onEdit={(order) => setEditing(order)}
                    onImport={(items, mode) => {
                        if (mode === "replace") {
                            replaceAll(items);
                        } else {
                            append(items);
                        }
                    }}
                />
            </Panel>

            {editing && (
                <OrderEditModal
                    order={editing}
                    onSave={(patch) => update(editing.id, patch)}
                    onClose={() => setEditing(null)}
                />
            )}
        </Canvas>
    );
}
