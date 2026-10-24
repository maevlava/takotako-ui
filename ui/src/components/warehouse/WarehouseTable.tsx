import { Fragment, useMemo, useState } from "react";
import { ChevronRight, PackagePlus, Plus, Search, Settings2, Trash2 } from "lucide-react";
import {
    categoryColor,
    formatDate,
    formatRupiah,
    isUrl,
    makeBatch,
    nearestExpiry,
    normalizeUrl,
    totalStock,
    type Ingredient,
} from "../../data/ingredients";
import { useIngredients } from "../../hooks/useIngredients";
import { columnDivider, fieldClass, noSpinner } from "../../lib/ui";
import { batchLevel, effectivePar, itemDaysToNext, itemLevel, levelMeta } from "../../data/warehouse";
import IngredientIcon from "../common/IngredientIcon";
import SortHeader from "../common/SortHeader";
import RestockModal, { type RestockUpdate } from "./RestockModal";
import LevelSettingsModal from "./LevelSettingsModal";

type SortKey = "name" | "stock" | "value" | "expiry";

const sortValue = (item: Ingredient, key: SortKey) => {
    if (key === "value") return totalStock(item) * item.price;
    if (key === "expiry") return nearestExpiry(item) ?? 99999;
    if (key === "stock") return totalStock(item);
    return item.name;
};

export default function WarehouseTable() {
    const { items, update } = useIngredients();
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });
    const [restocking, setRestocking] = useState(false);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [draft, setDraft] = useState<Record<string, { qty: number; expiryDays: number }>>({});
    const [settings, setSettings] = useState<Ingredient | null>(null);

    const toggleSort = (key: SortKey) =>
        setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

    const toggleExpand = (id: string) =>
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });

    const draftFor = (id: string) => draft[id] ?? { qty: 1, expiryDays: 7 };
    const setDraftFor = (id: string, patch: Partial<{ qty: number; expiryDays: number }>) =>
        setDraft((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { qty: 1, expiryDays: 7 }), ...patch } }));

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = q
            ? items.filter((item) =>
                  [item.name, item.category, item.supplier].some((value) => value.toLowerCase().includes(q))
              )
            : items;
        const dir = sort.dir === "asc" ? 1 : -1;
        return [...filtered].sort((a, b) => {
            const av = sortValue(a, sort.key);
            const bv = sortValue(b, sort.key);
            if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
            return String(av).localeCompare(String(bv)) * dir;
        });
    }, [items, query, sort]);

    const totalValue = useMemo(() => items.reduce((sum, item) => sum + totalStock(item) * item.price, 0), [items]);
    const needRestock = items.filter((item) => itemLevel(item) === "red").length;
    const expiringSoon = items.filter((item) => {
        const expiry = nearestExpiry(item);
        return expiry !== null && expiry <= 3;
    }).length;

    const applyBatches = (item: Ingredient, batches: Ingredient["batches"]) =>
        update(item.id, { batches, stock: (batches ?? []).reduce((sum, batch) => sum + batch.qty, 0) });

    const addBatch = (item: Ingredient, qty: number, expiryDays: number) =>
        applyBatches(item, [...(item.batches ?? []), makeBatch(qty, expiryDays)]);

    const updateBatch = (item: Ingredient, batchId: string, patch: { qty?: number; expiryDays?: number }) =>
        applyBatches(
            item,
            (item.batches ?? []).map((batch) => (batch.id === batchId ? { ...batch, ...patch } : batch))
        );

    const removeBatch = (item: Ingredient, batchId: string) =>
        applyBatches(
            item,
            (item.batches ?? []).filter((batch) => batch.id !== batchId)
        );

    const applyRestock = (updates: RestockUpdate[]) => {
        for (const entry of updates) {
            const item = items.find((candidate) => candidate.id === entry.id);
            if (item) addBatch(item, entry.qty, entry.expiryDays);
        }
    };

    const cell = (extra = "") =>
        `border-y border-border bg-bg px-4 py-2.5 align-middle transition-colors group-hover:bg-surface ${extra}`;

    return (
        <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari bahan / supplier..."
                        className="w-64 rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-fg outline-none placeholder:text-faint focus:border-lavender"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm text-muted">
                        Nilai stok: <span className="font-semibold text-green">{formatRupiah(totalValue)}</span>
                    </span>
                    <span className="text-sm text-muted">
                        Perlu restock: <span className="font-semibold text-red">{needRestock}</span>
                    </span>
                    <span className="text-sm text-muted">
                        Expiry ≤3 hari: <span className="font-semibold text-yellow">{expiringSoon}</span>
                    </span>
                    <button
                        onClick={() => setRestocking(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-green px-3 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                    >
                        <PackagePlus size={16} /> Restock
                    </button>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2 text-left">
                    <thead>
                        <tr className="text-xs font-semibold text-faint">
                            <th className="px-4 pb-1">
                                <SortHeader
                                    label="Nama"
                                    active={sort.key === "name"}
                                    dir={sort.dir}
                                    onToggle={() => toggleSort("name")}
                                />
                            </th>
                            <th className="px-4 pb-1">
                                <SortHeader
                                    label="Stok / Par"
                                    active={sort.key === "stock"}
                                    dir={sort.dir}
                                    onToggle={() => toggleSort("stock")}
                                />
                            </th>
                            <th className="px-4 pb-1">Pakai/hari</th>
                            <th className="px-4 pb-1">Level</th>
                            <th className="px-4 pb-1">
                                <SortHeader
                                    label="Nilai"
                                    active={sort.key === "value"}
                                    dir={sort.dir}
                                    onToggle={() => toggleSort("value")}
                                />
                            </th>
                            <th className="px-4 pb-1">
                                <SortHeader
                                    label="Expiry"
                                    active={sort.key === "expiry"}
                                    dir={sort.dir}
                                    onToggle={() => toggleSort("expiry")}
                                />
                            </th>
                            <th className="px-4 pb-1">Supplier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((item) => {
                            const color = categoryColor[item.category];
                            const level = itemLevel(item);
                            const meta = levelMeta[level];
                            const projection = itemDaysToNext(item);
                            const expiry = nearestExpiry(item);
                            const batchCount = item.batches?.length ?? 0;
                            const expiryClass =
                                expiry === null
                                    ? "text-faint"
                                    : expiry <= 2
                                      ? "text-red"
                                      : expiry <= 5
                                        ? "text-yellow"
                                        : "text-fg";
                            const isOpen = expanded.has(item.id);
                            const draftItem = draftFor(item.id);
                            return (
                                <Fragment key={item.id}>
                                    <tr className="group">
                                        <td className={cell("rounded-l-xl border-l")}>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleExpand(item.id)}
                                                    className={`flex size-6 shrink-0 items-center justify-center rounded-md text-muted transition-all hover:bg-surface hover:text-fg ${
                                                        isOpen ? "rotate-90" : ""
                                                    }`}
                                                >
                                                    <ChevronRight size={15} />
                                                </button>
                                                <IngredientIcon value={item.emoji} border={color.border} bg={color.bg} />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-fg">{item.name}</span>
                                                    <span className={`text-xs ${color.text}`}>{item.category}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={cell(columnDivider)}>
                                            <div className="flex items-center gap-1 whitespace-nowrap">
                                                <span className="w-10 text-right font-medium text-fg">
                                                    {totalStock(item)}
                                                </span>
                                                <span className="text-muted">/</span>
                                                <input
                                                    type="number"
                                                    value={effectivePar(item)}
                                                    onChange={(event) =>
                                                        update(item.id, { parLevel: Number(event.target.value) })
                                                    }
                                                    className={`${fieldClass} ${noSpinner} w-16 text-right text-muted`}
                                                />
                                                <span className="text-xs text-faint">{item.unit}</span>
                                            </div>
                                        </td>
                                        <td className={cell(columnDivider)}>
                                            <div className="flex items-center gap-1 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    value={item.dailyUsage ?? 0}
                                                    onChange={(event) =>
                                                        update(item.id, { dailyUsage: Number(event.target.value) })
                                                    }
                                                    className={`${fieldClass} ${noSpinner} w-16 text-right text-fg`}
                                                />
                                                <span className="text-xs text-faint">/hari</span>
                                            </div>
                                        </td>
                                        <td className={cell(columnDivider)}>
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${meta.bg} ${meta.text}`}
                                                    >
                                                        <span className={`size-1.5 rounded-full ${meta.dot}`} />
                                                        {meta.label}
                                                    </span>
                                                    <span className="text-xs text-faint">
                                                        {level === "red"
                                                            ? "Perlu restock"
                                                            : projection
                                                              ? `≈ ${projection.days} hari ke ${levelMeta[projection.next].label}`
                                                              : "—"}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setSettings(item)}
                                                    title="Atur level"
                                                    className="shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-surface hover:text-lavender"
                                                >
                                                    <Settings2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className={`${cell(columnDivider)} whitespace-nowrap font-medium text-fg`}>
                                            {formatRupiah(totalStock(item) * item.price)}
                                        </td>
                                        <td className={cell(columnDivider)}>
                                            <div className="flex flex-col">
                                                <span className={`font-medium ${expiryClass}`}>
                                                    {expiry === null ? "-" : `${expiry} hari`}
                                                </span>
                                                <span className="text-xs text-faint">{batchCount} batch</span>
                                            </div>
                                        </td>
                                        <td className={cell("rounded-r-xl border-r")}>
                                            {isUrl(item.supplier) ? (
                                                <a
                                                    href={normalizeUrl(item.supplier)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue transition-colors hover:text-lavender"
                                                >
                                                    {item.supplier}
                                                </a>
                                            ) : (
                                                <span className="text-muted">{item.supplier || "-"}</span>
                                            )}
                                        </td>
                                    </tr>

                                    {isOpen &&
                                        item.batches?.map((batch) => {
                                            const bLevel = batchLevel(batch, item);
                                            const bMeta = levelMeta[bLevel];
                                            const bExpiryClass =
                                                batch.expiryDays <= 2
                                                    ? "text-red"
                                                    : batch.expiryDays <= 5
                                                      ? "text-yellow"
                                                      : "text-fg";
                                            return (
                                                <tr key={batch.id} className="group">
                                                    <td className={cell("rounded-l-xl border-l")}>
                                                        <div className="flex items-center gap-2 pl-8">
                                                            <span className={`size-1.5 shrink-0 rounded-full ${bMeta.dot}`} />
                                                            <IngredientIcon
                                                                value={item.emoji}
                                                                border={color.border}
                                                                bg={color.bg}
                                                                small
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-fg">
                                                                    {item.name}
                                                                </span>
                                                                <span className="text-xs text-muted">
                                                                    {formatDate(batch.addedAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={cell(columnDivider)}>
                                                        <div className="flex items-center gap-1 whitespace-nowrap">
                                                            <input
                                                                type="number"
                                                                value={batch.qty}
                                                                onChange={(event) =>
                                                                    updateBatch(item, batch.id, {
                                                                        qty: Number(event.target.value),
                                                                    })
                                                                }
                                                                className={`${fieldClass} ${noSpinner} w-16 text-right text-fg`}
                                                            />
                                                            <span className="text-xs text-faint">{item.unit}</span>
                                                        </div>
                                                    </td>
                                                    <td className={cell(columnDivider)}>
                                                        <span className="text-xs text-faint">
                                                            {item.dailyUsage ?? 0}/hari
                                                        </span>
                                                    </td>
                                                    <td className={cell(columnDivider)}>
                                                        <span
                                                            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${bMeta.bg} ${bMeta.text}`}
                                                        >
                                                            <span className={`size-1.5 rounded-full ${bMeta.dot}`} />
                                                            {bMeta.label}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`${cell(columnDivider)} whitespace-nowrap text-sm text-fg`}
                                                    >
                                                        {formatRupiah(batch.qty * item.price)}
                                                    </td>
                                                    <td className={cell(columnDivider)}>
                                                        <div className="flex items-center gap-1 whitespace-nowrap">
                                                            <input
                                                                type="number"
                                                                value={batch.expiryDays}
                                                                onChange={(event) =>
                                                                    updateBatch(item, batch.id, {
                                                                        expiryDays: Number(event.target.value),
                                                                    })
                                                                }
                                                                className={`${fieldClass} ${noSpinner} w-16 text-right ${bExpiryClass}`}
                                                            />
                                                            <span className="text-xs text-faint">hari</span>
                                                        </div>
                                                    </td>
                                                    <td className={cell("rounded-r-xl border-r")}>
                                                        <button
                                                            onClick={() => removeBatch(item, batch.id)}
                                                            className="text-muted transition-colors hover:text-red"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                    {isOpen && (
                                        <tr>
                                            <td className={cell("rounded-l-xl border-l")}>
                                                <span className="pl-10 text-xs text-faint">Tambah batch</span>
                                            </td>
                                            <td className={cell(columnDivider)}>
                                                <div className="flex items-center gap-1 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={draftItem.qty}
                                                        onChange={(event) =>
                                                            setDraftFor(item.id, { qty: Number(event.target.value) })
                                                        }
                                                        className={`${fieldClass} ${noSpinner} w-16 text-right text-fg`}
                                                    />
                                                    <span className="text-xs text-faint">{item.unit}</span>
                                                </div>
                                            </td>
                                            <td className={cell(columnDivider)} />
                                            <td className={cell(columnDivider)} />
                                            <td className={cell(columnDivider)} />
                                            <td className={cell(columnDivider)}>
                                                <div className="flex items-center gap-1 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={draftItem.expiryDays}
                                                        onChange={(event) =>
                                                            setDraftFor(item.id, {
                                                                expiryDays: Number(event.target.value),
                                                            })
                                                        }
                                                        className={`${fieldClass} ${noSpinner} w-16 text-right text-fg`}
                                                    />
                                                    <span className="text-xs text-faint">hari</span>
                                                </div>
                                            </td>
                                            <td className={cell("rounded-r-xl border-r")}>
                                                <button
                                                    onClick={() => addBatch(item, draftItem.qty, draftItem.expiryDays)}
                                                    className="flex items-center gap-1 rounded-md bg-surface-hover px-2.5 py-1 text-xs font-medium text-fg transition-colors hover:bg-surface"
                                                >
                                                    <Plus size={13} /> Tambah
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
                {visible.length === 0 && <p className="py-8 text-center text-sm text-muted">Tidak ada bahan.</p>}
            </div>

            {restocking && (
                <RestockModal ingredients={items} onConfirm={applyRestock} onClose={() => setRestocking(false)} />
            )}

            {settings && (
                <LevelSettingsModal
                    item={settings}
                    onSave={(patch) => update(settings.id, patch)}
                    onClose={() => setSettings(null)}
                />
            )}
        </div>
    );
}
