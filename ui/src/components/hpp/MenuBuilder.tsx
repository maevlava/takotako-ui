import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, X } from "lucide-react";
import {
    defaultLineUnit,
    formatRupiah,
    isImage,
    lineCost,
    unitsForUnit,
    type Ingredient,
} from "../../data/ingredients";
import {
    findIngredient,
    menuCategories,
    menuPortionSize,
    menuPrice,
    type MenuCategory,
    type MenuItem,
    type RecipeLine,
} from "../../data/menus";
import { fieldBoxClass, noSpinner } from "../../lib/ui";

interface MenuBuilderProps {
    initial?: MenuItem;
    ingredients: Ingredient[];
    onSave: (data: Omit<MenuItem, "id">) => void;
    onClose: () => void;
}

export default function MenuBuilder({ initial, ingredients, onSave, onClose }: MenuBuilderProps) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [image, setImage] = useState(initial?.image ?? "🍽️");
    const [category, setCategory] = useState<MenuCategory>(initial?.category ?? "Takoyaki");
    const [recipe, setRecipe] = useState<RecipeLine[]>(initial?.recipe ?? []);
    const [yieldQty, setYieldQty] = useState(initial?.yieldQty ?? 1);
    const [portionSize, setPortionSize] = useState(initial ? menuPortionSize(initial) : 1);
    const [price, setPrice] = useState(initial ? Math.round(menuPrice(initial, ingredients)) : 0);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const picked = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? ingredients.filter((item) => item.name.toLowerCase().includes(q)) : ingredients;
    }, [ingredients, query]);

    const batchTotal = recipe.reduce((sum, line) => {
        const ingredient = findIngredient(ingredients, line);
        return ingredient ? sum + lineCost(ingredient, line.qty, line.unit) : sum;
    }, 0);
    const output = Number.isFinite(yieldQty) && yieldQty > 0 ? yieldQty : 1;
    const perPiece = batchTotal / output;
    const portion = Number.isFinite(portionSize) && portionSize >= 1 ? Math.floor(portionSize) : 1;
    const priceValue = Number.isFinite(price) && price >= 0 ? price : 0;
    const portionCost = perPiece * portion;
    const margin = priceValue > 0 ? ((priceValue - portionCost) / priceValue) * 100 : 0;

    const addLine = (ingredient: Ingredient) =>
        setRecipe((prev) => [
            ...prev,
            {
                ingredientId: ingredient.id,
                ingredientName: ingredient.name,
                qty: 1,
                unit: defaultLineUnit(ingredient.unit),
            },
        ]);

    const updateLine = (index: number, patch: Partial<RecipeLine>) =>
        setRecipe((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));

    const removeLine = (index: number) => setRecipe((prev) => prev.filter((_, i) => i !== index));

    const save = () => {
        if (!name.trim()) return;
        onSave({
            name: name.trim(),
            description: description.trim(),
            image: image.trim() || "🍽️",
            category,
            recipe,
            yieldQty: Math.max(1, Math.floor(output)),
            portionSize: portion,
            price: priceValue,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-surface"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-3">
                    <h2 className="font-semibold text-fg">{initial ? "Edit Recipe" : "Make Recipe"}</h2>
                    <button onClick={onClose} className="rounded-md p-1 text-muted transition-colors hover:text-fg">
                        <X size={18} />
                    </button>
                </header>

                <div className="grid flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-2">
                    <div className="flex flex-col gap-5 rounded-xl border border-border bg-bg p-4">
                        <div className="flex flex-col gap-3">
                            <p className="text-xs uppercase tracking-wide text-faint">Menu</p>
                            <div className="flex items-center gap-3">
                                <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-border bg-surface text-3xl">
                                    {isImage(image) ? (
                                        <img src={image} alt="" className="size-full object-cover" />
                                    ) : (
                                        image
                                    )}
                                </span>
                                <div className="flex flex-1 flex-col gap-2">
                                    <input
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="Nama menu"
                                        className={`${fieldBoxClass} text-fg`}
                                    />
                                    <input
                                        value={image}
                                        onChange={(event) => setImage(event.target.value)}
                                        placeholder="emoji / URL gambar"
                                        className={`${fieldBoxClass} text-xs text-muted`}
                                    />
                                </div>
                            </div>
                            <textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Deskripsi"
                                rows={3}
                                className={`${fieldBoxClass} text-sm text-fg`}
                            />
                            <select
                                value={category}
                                onChange={(event) => setCategory(event.target.value as MenuCategory)}
                                className={`${fieldBoxClass} cursor-pointer text-sm text-fg`}
                            >
                                {menuCategories.map((item) => (
                                    <option key={item} value={item} className="bg-surface text-fg">
                                        {item}
                                    </option>
                                ))}
                            </select>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-faint">Isi / porsi (pcs)</span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={portionSize}
                                        onChange={(event) => setPortionSize(Number(event.target.value))}
                                        className={`${fieldBoxClass} ${noSpinner} text-sm text-fg`}
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-faint">Harga jual / porsi</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={price}
                                        onChange={(event) => setPrice(Number(event.target.value))}
                                        className={`${fieldBoxClass} ${noSpinner} text-sm text-fg`}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-border pt-4">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs uppercase tracking-wide text-faint">Resep</p>
                                <span className="text-xs text-faint">bahan untuk 1 batch</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {recipe.map((line, index) => {
                                    const ingredient = findIngredient(ingredients, line);
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5"
                                        >
                                            <span className="flex-1 truncate text-sm text-fg">
                                                {ingredient?.emoji} {line.ingredientName}
                                            </span>
                                            <input
                                                type="number"
                                                value={line.qty}
                                                onChange={(event) =>
                                                    updateLine(index, { qty: Number(event.target.value) })
                                                }
                                                className={`${fieldBoxClass} ${noSpinner} w-16 px-2 py-1 text-right text-sm text-fg`}
                                            />
                                            <select
                                                value={line.unit}
                                                onChange={(event) => updateLine(index, { unit: event.target.value })}
                                                className={`${fieldBoxClass} w-16 cursor-pointer px-2 py-1 text-sm text-fg`}
                                            >
                                                {unitsForUnit(ingredient?.unit ?? "pcs").map((unit) => (
                                                    <option key={unit} value={unit} className="bg-surface text-fg">
                                                        {unit}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="w-24 text-right text-xs text-green">
                                                {formatRupiah(ingredient ? lineCost(ingredient, line.qty, line.unit) : 0)}
                                            </span>
                                            <button
                                                onClick={() => removeLine(index)}
                                                className="text-muted transition-colors hover:text-red"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                                {recipe.length === 0 && (
                                    <p className="text-xs text-faint">Belum ada bahan. Pilih dari daftar di samping.</p>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2">
                                <div className="flex flex-col">
                                    <span className="text-sm text-fg">Hasil jadi</span>
                                    <span className="text-xs text-faint">
                                        Satu batch resep ini menghasilkan berapa pcs?
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min={1}
                                        value={yieldQty}
                                        onChange={(event) => setYieldQty(Number(event.target.value))}
                                        className={`${fieldBoxClass} ${noSpinner} w-16 px-2 py-1 text-right text-sm text-fg`}
                                    />
                                    <span className="text-xs text-muted">pcs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="relative mb-3">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Cari bahan..."
                                className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-fg outline-none placeholder:text-faint focus:border-lavender"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-bg">
                            {picked.map((ingredient) => (
                                <button
                                    key={ingredient.id}
                                    onClick={() => addLine(ingredient)}
                                    className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-sm transition-colors last:border-b-0 hover:bg-surface"
                                >
                                    <span>{ingredient.emoji}</span>
                                    <span className="flex-1 truncate text-fg">{ingredient.name}</span>
                                    <span className="text-xs text-faint">
                                        {formatRupiah(ingredient.price)}/{ingredient.unit}
                                    </span>
                                </button>
                            ))}
                            {picked.length === 0 && (
                                <p className="px-3 py-4 text-center text-xs text-faint">Bahan tidak ditemukan.</p>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="flex items-center justify-between border-t border-border px-5 py-3">
                    <span className="text-sm text-muted">
                        Total batch: <span className="font-semibold text-green">{formatRupiah(batchTotal)}</span>
                        {output > 1 && (
                            <>
                                {" · "}
                                Per pcs: <span className="font-semibold text-green">{formatRupiah(perPiece)}</span>
                            </>
                        )}
                        {priceValue > 0 && (
                            <>
                                {" · "}
                                Margin:{" "}
                                <span className={`font-semibold ${margin >= 0 ? "text-green" : "text-red"}`}>
                                    {margin.toFixed(1)}%
                                </span>
                            </>
                        )}
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
                            className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                        >
                            {initial ? "Simpan" : "Buat"}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
