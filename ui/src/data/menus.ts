import { lineCost, type Ingredient } from "./ingredients";

export type MenuCategory = "Takoyaki" | "Okonomiyaki" | "Corn Dog";

export const menuCategories: MenuCategory[] = ["Takoyaki", "Okonomiyaki", "Corn Dog"];

export interface RecipeLine {
    ingredientId: string;
    ingredientName: string;
    qty: number;
    unit: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    image: string;
    category: MenuCategory;
    recipe: RecipeLine[];
    /** Jumlah pcs/porsi yang dihasilkan dari satu resep (batch). Default 1. */
    yieldQty?: number;
    /** Jumlah pcs takoyaki dalam satu porsi. Default 1. */
    portionSize?: number;
    /** Harga jual per porsi. */
    price?: number;
    /** @deprecated Dulu jadi acuan harga; sekarang hanya fallback untuk data lama. */
    margin?: number;
}

export const makeMenuId = () => Math.random().toString(36).slice(2, 10);

export function findIngredient(ingredients: Ingredient[], line: RecipeLine): Ingredient | undefined {
    return (
        ingredients.find((item) => item.id === line.ingredientId) ??
        ingredients.find((item) => item.name.toLowerCase() === line.ingredientName.toLowerCase())
    );
}

export function menuYield(menu: MenuItem): number {
    const value = menu.yieldQty ?? 1;
    return Number.isFinite(value) && value > 0 ? value : 1;
}

/** Total biaya bahan untuk satu batch resep (sebelum dibagi hasil jadi). */
export function menuBatchCost(menu: MenuItem, ingredients: Ingredient[]): number {
    return menu.recipe.reduce((sum, line) => {
        const ingredient = findIngredient(ingredients, line);
        return ingredient ? sum + lineCost(ingredient, line.qty, line.unit) : sum;
    }, 0);
}

/** HPP per pcs. */
export function menuCost(menu: MenuItem, ingredients: Ingredient[]): number {
    return menuBatchCost(menu, ingredients) / menuYield(menu);
}

export function menuPortionSize(menu: MenuItem): number {
    const value = menu.portionSize ?? 1;
    return Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1;
}

/** HPP untuk satu porsi (isi porsi x HPP per pcs). */
export function menuPortionCost(menu: MenuItem, ingredients: Ingredient[]): number {
    return menuCost(menu, ingredients) * menuPortionSize(menu);
}

const legacyPrice = (menu: MenuItem, ingredients: Ingredient[]): number => {
    const margin = menu.margin ?? 100;
    return menuPortionCost(menu, ingredients) * (1 + margin / 100);
};

/** Harga jual per porsi. Data lama tanpa harga memakai margin sebagai fallback. */
export function menuPrice(menu: MenuItem, ingredients: Ingredient[]): number {
    const value = menu.price;
    return typeof value === "number" && Number.isFinite(value) && value >= 0
        ? value
        : legacyPrice(menu, ingredients);
}

/** Margin dalam persen dari harga jual. */
export function menuMargin(menu: MenuItem, ingredients: Ingredient[]): number {
    const price = menuPrice(menu, ingredients);
    if (price <= 0) return 0;
    return ((price - menuPortionCost(menu, ingredients)) / price) * 100;
}

export const seedMenus: MenuItem[] = [
    {
        id: "menu-takoyaki-original",
        name: "Takoyaki Original",
        description: "Takoyaki klasik isi gurita dengan saus dan taburan nori.",
        image: "🐙",
        category: "Takoyaki",
        recipe: [
            { ingredientId: "octopus", ingredientName: "Octopus", qty: 50, unit: "g" },
            { ingredientId: "garlic", ingredientName: "Garlic", qty: 10, unit: "g" },
            { ingredientId: "soy-sauce", ingredientName: "Soy Sauce", qty: 20, unit: "ml" },
        ],
    },
    {
        id: "menu-takoyaki-cheese",
        name: "Takoyaki Cheese",
        description: "Takoyaki gurita dengan lelehan keju mozzarella.",
        image: "🧀",
        category: "Takoyaki",
        recipe: [
            { ingredientId: "octopus", ingredientName: "Octopus", qty: 40, unit: "g" },
            { ingredientId: "cheese", ingredientName: "Cheese", qty: 20, unit: "g" },
            { ingredientId: "garlic", ingredientName: "Garlic", qty: 8, unit: "g" },
            { ingredientId: "soy-sauce", ingredientName: "Soy Sauce", qty: 15, unit: "ml" },
        ],
    },
    {
        id: "menu-okonomiyaki",
        name: "Okonomiyaki",
        description: "Pancake ala Jepang dengan kol, tomat, dan ayam.",
        image: "🥬",
        category: "Okonomiyaki",
        recipe: [
            { ingredientId: "lettuce", ingredientName: "Lettuce", qty: 100, unit: "g" },
            { ingredientId: "tomato", ingredientName: "Tomato", qty: 1, unit: "pcs" },
            { ingredientId: "chicken", ingredientName: "Chicken", qty: 100, unit: "g" },
            { ingredientId: "soy-sauce", ingredientName: "Soy Sauce", qty: 15, unit: "ml" },
        ],
    },
    {
        id: "menu-corn-dog",
        name: "Corn Dog",
        description: "Sosis ayam berbalut adonan, renyah di luar lembut di dalam.",
        image: "🍗",
        category: "Corn Dog",
        recipe: [
            { ingredientId: "chicken", ingredientName: "Chicken", qty: 80, unit: "g" },
            { ingredientId: "cheese", ingredientName: "Cheese", qty: 30, unit: "g" },
            { ingredientId: "rice", ingredientName: "Rice", qty: 40, unit: "g" },
        ],
    },
];
