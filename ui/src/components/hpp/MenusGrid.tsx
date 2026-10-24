import { useState } from "react";
import { Plus } from "lucide-react";
import { useIngredients } from "../../hooks/useIngredients";
import { useMenus } from "../../hooks/useMenus";
import { menuCategories, type MenuCategory, type MenuItem } from "../../data/menus";
import MenuCard from "./MenuCard";
import MenuBuilder from "./MenuBuilder";

type Filter = MenuCategory | "All";

const filters: Filter[] = ["All", ...menuCategories];

export default function MenusGrid() {
    const { menus, add, update, remove } = useMenus();
    const { items: ingredients } = useIngredients();
    const [filter, setFilter] = useState<Filter>("All");
    const [building, setBuilding] = useState(false);
    const [editing, setEditing] = useState<MenuItem | null>(null);

    const shown = filter === "All" ? menus : menus.filter((menu) => menu.category === filter);

    const openNew = () => {
        setEditing(null);
        setBuilding(true);
    };

    const openEdit = (menu: MenuItem) => {
        setEditing(menu);
        setBuilding(true);
    };

    const close = () => {
        setBuilding(false);
        setEditing(null);
    };

    const save = (data: Omit<MenuItem, "id">) => {
        if (editing) {
            update(editing.id, data);
        } else {
            add(data);
        }
        close();
    };

    return (
        <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg p-1">
                    {filters.map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                filter === item ? "bg-surface-hover text-lavender" : "text-muted hover:text-fg"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-1.5 rounded-lg bg-green px-3 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                >
                    <Plus size={16} /> Make recipe
                </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {shown.map((menu) => (
                    <MenuCard
                        key={menu.id}
                        menu={menu}
                        ingredients={ingredients}
                        onEdit={() => openEdit(menu)}
                        onDelete={() => remove(menu.id)}
                        onPortionChange={(value) => update(menu.id, { portionSize: value })}
                        onPriceChange={(value) => update(menu.id, { price: value })}
                    />
                ))}
            </div>
            {shown.length === 0 && <p className="py-8 text-center text-sm text-muted">Belum ada menu.</p>}

            {building && (
                <MenuBuilder
                    initial={editing ?? undefined}
                    ingredients={ingredients}
                    onSave={save}
                    onClose={close}
                />
            )}
        </div>
    );
}
