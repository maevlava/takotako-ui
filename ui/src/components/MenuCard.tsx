import { Pencil, Trash2 } from "lucide-react";
import { formatRupiah, isImage, type Ingredient } from "../data/ingredients";
import { findIngredient, menuCost, type MenuItem } from "../data/menus";
import { fieldClass, noSpinner } from "../lib/ui";

interface MenuCardProps {
    menu: MenuItem;
    ingredients: Ingredient[];
    onEdit: () => void;
    onDelete: () => void;
    onMarginChange: (margin: number) => void;
}

export default function MenuCard({ menu, ingredients, onEdit, onDelete, onMarginChange }: MenuCardProps) {
    const cost = menuCost(menu, ingredients);
    const margin = menu.margin ?? 100;
    const profit = cost * (margin / 100);
    const selling = cost + profit;
    const minSelling = cost * 1.5;

    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-bg">
            <div className="flex h-40 shrink-0 items-center justify-center overflow-hidden bg-surface text-6xl">
                {isImage(menu.image) ? (
                    <img src={menu.image} alt={menu.name} className="size-full object-cover" />
                ) : (
                    menu.image
                )}
            </div>
            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-fg">{menu.name}</h3>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onEdit}
                            className="rounded-md p-1 text-muted transition-colors hover:text-lavender"
                        >
                            <Pencil size={15} />
                        </button>
                        <button
                            onClick={onDelete}
                            className="rounded-md p-1 text-muted transition-colors hover:text-red"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                </div>
                <span className="mt-1 w-fit rounded-full border border-border px-2 py-0.5 text-xs text-faint">
                    {menu.category}
                </span>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{menu.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                    {menu.recipe.map((line, index) => {
                        const ingredient = findIngredient(ingredients, line);
                        return (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 text-xs text-muted"
                            >
                                {ingredient && <span>{ingredient.emoji}</span>}
                                {line.ingredientName} {line.qty}
                                {line.unit}
                            </span>
                        );
                    })}
                </div>

                <div className="mt-auto flex flex-col gap-1.5 pt-4 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted">HPP (bersih)</span>
                        <span className="font-medium text-fg">{formatRupiah(cost)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted">Margin</span>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                value={margin}
                                onChange={(event) => onMarginChange(Number(event.target.value))}
                                className={`${fieldClass} ${noSpinner} w-16 text-right text-fg`}
                            />
                            <span className="text-muted">%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted">Harga jual</span>
                        <span className="font-semibold text-lavender">{formatRupiah(selling)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted">Keuntungan</span>
                        <span className="font-semibold text-green">{formatRupiah(profit)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
                        <span className="text-muted">Min. harga jual (50%)</span>
                        <span className="font-medium text-yellow">{formatRupiah(minSelling)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
