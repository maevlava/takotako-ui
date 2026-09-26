export type Category = "Veggie" | "Seafood" | "Meat" | "Grain" | "Dairy" | "Seasoning";

export const categories: Category[] = ["Veggie", "Seafood", "Meat", "Grain", "Dairy", "Seasoning"];

export const categoryColor: Record<Category, { text: string; border: string; bg: string; dot: string }> = {
    Veggie: { text: "text-green", border: "border-green", bg: "bg-green/10", dot: "bg-green" },
    Seafood: { text: "text-blue", border: "border-blue", bg: "bg-blue/10", dot: "bg-blue" },
    Meat: { text: "text-red", border: "border-red", bg: "bg-red/10", dot: "bg-red" },
    Grain: { text: "text-yellow", border: "border-yellow", bg: "bg-yellow/10", dot: "bg-yellow" },
    Dairy: { text: "text-orange", border: "border-orange", bg: "bg-orange/10", dot: "bg-orange" },
    Seasoning: { text: "text-purple", border: "border-purple", bg: "bg-purple/10", dot: "bg-purple" },
};

export interface Batch {
    id: string;
    addedAt: string;
    qty: number;
    expiryDays: number;
}

export interface Ingredient {
    id: string;
    name: string;
    emoji: string;
    category: Category;
    stock: number;
    price: number;
    unit: string;
    supplier: string;
    parLevel?: number;
    dailyUsage?: number;
    expiryDays?: number;
    batches?: Batch[];
    thresholds?: { high: number; normal: number; low: number };
}

export const makeId = () => Math.random().toString(36).slice(2, 10);

export const makeBatchId = () => Math.random().toString(36).slice(2, 10);

export const makeBatch = (
    qty: number,
    expiryDays: number,
    addedAt: string = new Date().toISOString()
): Batch => ({ id: makeBatchId(), addedAt, qty, expiryDays });

export const newIngredient = (): Ingredient => ({
    id: makeId(),
    name: "Bahan baru",
    emoji: "🍽️",
    category: "Veggie",
    stock: 0,
    price: 0,
    unit: "pcs",
    supplier: "",
    parLevel: 10,
    dailyUsage: 1,
    batches: [],
});

export const formatRupiah = (value: number) => `Rp ${Math.round(value).toLocaleString("id-ID")}`;

export const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

export const isImage = (value: string) => /^(https?:\/\/|\/|\.\/|data:image\/)/i.test(value.trim());

export const isUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || /\s/.test(trimmed)) return false;
    return /^(https?:\/\/|www\.)/i.test(trimmed) || /^[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(trimmed);
};

export const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export function totalStock(item: Ingredient): number {
    if (item.batches && item.batches.length > 0) {
        return item.batches.reduce((sum, batch) => sum + batch.qty, 0);
    }
    return item.stock;
}

export function nearestExpiry(item: Ingredient): number | null {
    if (item.batches && item.batches.length > 0) {
        return Math.min(...item.batches.map((batch) => batch.expiryDays));
    }
    return item.expiryDays ?? null;
}

export function unitBase(unit: string): { base: "g" | "ml" | "pcs"; factor: number } {
    const value = unit.trim().toLowerCase();
    if (value === "kg") return { base: "g", factor: 1000 };
    if (value === "g" || value === "gram") return { base: "g", factor: 1 };
    if (value === "l" || value === "liter") return { base: "ml", factor: 1000 };
    if (value === "ml") return { base: "ml", factor: 1 };
    const grams = /^(\d+(?:\.\d+)?)\s*g$/.exec(value);
    if (grams) return { base: "g", factor: Number(grams[1]) };
    const milliliters = /^(\d+(?:\.\d+)?)\s*ml$/.exec(value);
    if (milliliters) return { base: "ml", factor: Number(milliliters[1]) };
    return { base: "pcs", factor: 1 };
}

export function lineCost(ingredient: Ingredient, qty: number, unit: string): number {
    const ingredientUnit = unitBase(ingredient.unit);
    const lineUnit = unitBase(unit);
    if (ingredientUnit.base === lineUnit.base) {
        return (ingredient.price / ingredientUnit.factor) * qty * lineUnit.factor;
    }
    return ingredient.price * qty;
}

export function defaultLineUnit(unit: string): string {
    const base = unitBase(unit).base;
    if (base === "g") return "g";
    if (base === "ml") return "ml";
    return "pcs";
}

export function unitsForUnit(unit: string): string[] {
    const base = unitBase(unit).base;
    if (base === "g") return ["g", "kg"];
    if (base === "ml") return ["ml", "l"];
    return ["pcs", "pack", "bottle"];
}

const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

export const seedIngredients: Ingredient[] = [
    { id: "lettuce", name: "Lettuce", emoji: "🥬", category: "Veggie", stock: 20, price: 5000, unit: "100g", supplier: "Pasar Segar", parLevel: 30, dailyUsage: 2, batches: [makeBatch(12, 2, daysAgo(8)), makeBatch(8, 7, daysAgo(3))] },
    { id: "tomato", name: "Tomato", emoji: "🍅", category: "Veggie", stock: 15, price: 3000, unit: "pcs", supplier: "Pasar Segar", parLevel: 40, dailyUsage: 1.5, batches: [makeBatch(15, 6, daysAgo(2))] },
    { id: "garlic", name: "Garlic", emoji: "🧄", category: "Veggie", stock: 8, price: 20000, unit: "kg", supplier: "Toko Sembako", parLevel: 40, dailyUsage: 1, batches: [makeBatch(8, 20, daysAgo(12))] },
    { id: "octopus", name: "Octopus", emoji: "🐙", category: "Seafood", stock: 2, price: 45000, unit: "kg", supplier: "Nelayan Jaya", parLevel: 40, dailyUsage: 1, batches: [makeBatch(1, 1, daysAgo(2)), makeBatch(1, 10, daysAgo(1))] },
    { id: "salmon", name: "Salmon", emoji: "🐟", category: "Seafood", stock: 3, price: 120000, unit: "kg", supplier: "Nelayan Jaya", parLevel: 30, dailyUsage: 1, batches: [makeBatch(3, 2, daysAgo(1))] },
    { id: "beef", name: "Beef", emoji: "🥩", category: "Meat", stock: 6, price: 110000, unit: "kg", supplier: "Rumah Potong", parLevel: 30, dailyUsage: 1.5, batches: [makeBatch(6, 8, daysAgo(4))] },
    { id: "chicken", name: "Chicken", emoji: "🍗", category: "Meat", stock: 10, price: 35000, unit: "kg", supplier: "Rumah Potong", parLevel: 30, dailyUsage: 2, batches: [makeBatch(10, 5, daysAgo(3))] },
    { id: "rice", name: "Rice", emoji: "🍚", category: "Grain", stock: 50, price: 15000, unit: "kg", supplier: "Toko Sembako", parLevel: 60, dailyUsage: 3, batches: [makeBatch(30, 120, daysAgo(30)), makeBatch(20, 200, daysAgo(5))] },
    { id: "cheese", name: "Cheese", emoji: "🧀", category: "Dairy", stock: 4, price: 80000, unit: "kg", supplier: "Dairy Fresh", parLevel: 30, dailyUsage: 1, batches: [makeBatch(4, 14, daysAgo(5))] },
    { id: "soy-sauce", name: "Soy Sauce", emoji: "🫙", category: "Seasoning", stock: 12, price: 25000, unit: "600ml", supplier: "Toko Sembako", parLevel: 20, dailyUsage: 1, batches: [makeBatch(12, 60, daysAgo(10))] },
];
