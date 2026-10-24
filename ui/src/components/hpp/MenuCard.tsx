import { Pencil, Trash2 } from "lucide-react";
import { formatRupiah, isImage, type Ingredient } from "../../data/ingredients";
import {
    findIngredient,
    menuBatchCost,
    menuCost,
    menuMargin,
    menuPortionCost,
    menuPortionSize,
    menuPrice,
    menuYield,
    type MenuItem,
} from "../../data/menus";
import { fieldClass, noSpinner } from "../../lib/ui";

interface MenuCardProps {
    menu: MenuItem;
    ingredients: Ingredient[];
    onEdit: () => void;
    onDelete: () => void;
    onPortionChange: (portionSize: number) => void;
    onPriceChange: (price: number) => void;
}

export default function MenuCard({
    menu,
    ingredients,
    onEdit,
    onDelete,
    onPortionChange,
    onPriceChange,
}: MenuCardProps) {
    const cost = menuCost(menu, ingredients);
    const batchCost = menuBatchCost(menu, ingredients);
    const output = menuYield(menu);
    const portion = menuPortionSize(menu);
    const portionCost = menuPortionCost(menu, ingredients);
    const price = menuPrice(menu, ingredients);
    const margin = menuMargin(menu, ingredients);
    const profit = price - portionCost;
    const minPrice = portionCost * 2;
    const unit = portion > 1 ? "porsi" : "pcs";

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
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="w-fit rounded-full border border-border px-2 py-0.5 text-xs text-faint">
                        {menu.category}
                    </span>
                    {output > 1 && (
                        <span className="w-fit rounded-full border border-lavender/40 bg-lavender/10 px-2 py-0.5 text-xs text-lavender">
                            1 resep = {output} pcs
                        </span>
                    )}
                </div>
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
                    {output > 1 && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted">HPP batch ({output} pcs)</span>
                            <span className="font-medium text-fg">{formatRupiah(batchCost)}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-muted">HPP / pcs</span>
                        <span className="font-medium text-fg">{formatRupiah(cost)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted">Isi / porsi</span>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min={1}
                                value={portion}
                                onChange={(event) => onPortionChange(Number(event.target.value))}
                                className={`${fieldClass} ${noSpinner} w-16 text-right text-fg`}
                            />
                            <span className="text-muted">pcs</span>
                        </div>
                    </div>
                    {portion > 1 && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted">HPP / {unit}</span>
                            <span className="font-medium text-fg">{formatRupiah(portionCost)}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-muted">Harga jual / {unit}</span>
                        <div className="flex items-center gap-1">
                            <span className="text-muted">Rp</span>
                            <input
                                type="number"
                                min={0}
                                value={Math.round(price)}
                                onChange={(event) => onPriceChange(Number(event.target.value))}
                                className={`${fieldClass} ${noSpinner} w-24 text-right text-lavender`}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted">Margin</span>
                        <span className={`font-semibold ${margin >= 0 ? "text-green" : "text-red"}`}>
                            {margin.toFixed(1)}%
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted">Keuntungan / {unit}</span>
                        <span className={`font-semibold ${profit >= 0 ? "text-green" : "text-red"}`}>
                            {formatRupiah(profit)}
                        </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
                        <span className="text-muted">Min. harga jual ({unit}, margin 50%)</span>
                        <span className="font-medium text-yellow">{formatRupiah(minPrice)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
