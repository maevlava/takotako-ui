import { totalStock, type Batch, type Ingredient } from "./ingredients";

export type StockLevel = "high" | "normal" | "low" | "red";

export const levelMeta: Record<StockLevel, { label: string; text: string; bg: string; dot: string }> = {
    high: { label: "High", text: "text-green", bg: "bg-green/10", dot: "bg-green" },
    normal: { label: "Normal", text: "text-blue", bg: "bg-blue/10", dot: "bg-blue" },
    low: { label: "Low", text: "text-yellow", bg: "bg-yellow/10", dot: "bg-yellow" },
    red: { label: "Restock", text: "text-red", bg: "bg-red/10", dot: "bg-red" },
};

export interface LevelThresholds {
    high: number;
    normal: number;
    low: number;
}

const rank: Record<StockLevel, number> = { high: 3, normal: 2, low: 1, red: 0 };

export function effectivePar(item: Ingredient): number {
    if (item.parLevel && item.parLevel > 0) return item.parLevel;
    return Math.max(totalStock(item) * 2, 1);
}

export function itemThresholds(item: Ingredient): LevelThresholds {
    if (item.thresholds) return item.thresholds;
    const par = effectivePar(item);
    return {
        high: Math.round(par * 0.6 * 100) / 100,
        normal: Math.round(par * 0.3 * 100) / 100,
        low: Math.round(par * 0.1 * 100) / 100,
    };
}

export function levelForQty(qty: number, item: Ingredient): StockLevel {
    const t = itemThresholds(item);
    if (qty >= t.high) return "high";
    if (qty >= t.normal) return "normal";
    if (qty >= t.low) return "low";
    return "red";
}

export function stockLevel(item: Ingredient): StockLevel {
    return levelForQty(totalStock(item), item);
}

export function batchLevel(batch: Batch, item: Ingredient): StockLevel {
    return levelForQty(batch.qty, item);
}

export function lowestLevel(levels: StockLevel[]): StockLevel {
    return levels.reduce<StockLevel>((worst, level) => (rank[level] < rank[worst] ? level : worst), "high");
}

export function itemLevel(item: Ingredient): StockLevel {
    const batches = item.batches ?? [];
    if (batches.length === 0) return stockLevel(item);
    return lowestLevel(batches.map((batch) => batchLevel(batch, item)));
}

export function nextLevel(level: StockLevel): StockLevel | null {
    if (level === "high") return "normal";
    if (level === "normal") return "low";
    if (level === "low") return "red";
    return null;
}

export function itemDaysToNext(item: Ingredient): { days: number; next: StockLevel } | null {
    const level = itemLevel(item);
    const next = nextLevel(level);
    if (!next) return null;
    const usage = item.dailyUsage ?? 0;
    if (usage <= 0) return null;
    const thresholds = itemThresholds(item);
    const target = level === "high" ? thresholds.high : level === "normal" ? thresholds.normal : thresholds.low;
    return { days: Math.max(0, Math.round((totalStock(item) - target) / usage)), next };
}
