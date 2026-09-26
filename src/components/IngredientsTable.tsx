import { useMemo, useState } from "react";
import { ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { categories, categoryColor, isUrl, normalizeUrl, type Category } from "../data/ingredients";
import { useIngredients } from "../hooks/useIngredients";
import { columnDivider, fieldClass, noSpinner } from "../lib/ui";
import IngredientIcon from "./IngredientIcon";
import SortHeader from "./SortHeader";

type SortKey = "name" | "category" | "price" | "supplier";

const sortLabels: { key: SortKey; label: string }[] = [
    { key: "name", label: "Nama" },
    { key: "category", label: "Category" },
    { key: "price", label: "Cost" },
    { key: "supplier", label: "Supplier" },
];

export default function IngredientsTable() {
    const { items, update, add, remove } = useIngredients();
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

    const toggleSort = (key: SortKey) =>
        setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = q
            ? items.filter((item) =>
                [item.name, item.category, item.supplier].some((value) => value.toLowerCase().includes(q))
            )
            : items;
        const dir = sort.dir === "asc" ? 1 : -1;
        return [...filtered].sort((a, b) => {
            const av = a[sort.key];
            const bv = b[sort.key];
            if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
            return String(av).localeCompare(String(bv)) * dir;
        });
    }, [items, query, sort]);

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
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted">{items.length} bahan</span>
                    <button
                        onClick={add}
                        className="flex items-center gap-1.5 rounded-lg bg-green px-3 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                    >
                        <Plus size={16} /> Tambah
                    </button>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2 text-left">
                    <thead>
                        <tr className="text-xs font-semibold text-faint">
                            {sortLabels.map((entry) => (
                                <th key={entry.key} className="px-4 pb-1">
                                    <SortHeader
                                        label={entry.label}
                                        active={sort.key === entry.key}
                                        dir={sort.dir}
                                        onToggle={() => toggleSort(entry.key)}
                                    />
                                </th>
                            ))}
                            <th className="px-4 pb-1" />
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((item) => {
                            const color = categoryColor[item.category];
                            const supplierIsUrl = isUrl(item.supplier);
                            return (
                                <tr key={item.id} className="group">
                                    <td className={cell("rounded-l-xl border-l")}>
                                        <div className="flex items-center gap-3">
                                            <IngredientIcon value={item.emoji} border={color.border} bg={color.bg} />
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    value={item.name}
                                                    onChange={(event) => update(item.id, { name: event.target.value })}
                                                    className={`${fieldClass} w-32 font-medium text-fg`}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className={cell(columnDivider)}>
                                        <select
                                            value={item.category}
                                            onChange={(event) =>
                                                update(item.id, { category: event.target.value as Category })
                                            }
                                            className={`cursor-pointer rounded-full border border-transparent bg-transparent px-2.5 py-0.5 text-sm outline-none transition-colors hover:border-border focus:border-lavender focus:bg-surface ${color.text}`}
                                        >
                                            {categories.map((category) => (
                                                <option key={category} value={category} className="bg-surface text-fg">
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className={cell(columnDivider)}>
                                        <div className="flex items-center gap-1 whitespace-nowrap">
                                            <span className="text-muted">Rp</span>
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(event) =>
                                                    update(item.id, { price: Number(event.target.value) })
                                                }
                                                className={`${fieldClass} ${noSpinner} w-24 text-right text-fg`}
                                            />
                                            <span className="text-muted">/</span>
                                            <input
                                                value={item.unit}
                                                onChange={(event) => update(item.id, { unit: event.target.value })}
                                                className={`${fieldClass} w-14 text-muted`}
                                            />
                                        </div>
                                    </td>
                                    <td className={cell(columnDivider)}>
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={item.supplier}
                                                placeholder="Supplier / link"
                                                onChange={(event) => update(item.id, { supplier: event.target.value })}
                                                className={`${fieldClass} w-40 text-fg placeholder:text-faint`}
                                            />
                                            {supplierIsUrl && (
                                                <a
                                                    href={normalizeUrl(item.supplier)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue transition-colors hover:text-lavender"
                                                >
                                                    <ExternalLink size={15} />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className={cell("rounded-r-xl border-r")}>
                                        <button
                                            onClick={() => remove(item.id)}
                                            className="text-muted transition-colors hover:text-red"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {visible.length === 0 && <p className="py-8 text-center text-sm text-muted">Tidak ada bahan.</p>}
            </div>
        </div>
    );
}
