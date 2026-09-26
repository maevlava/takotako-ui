export type EntryType = "income" | "expense";

export const incomeCategories = ["Dine-in", "Takeaway", "Delivery", "Catering", "Lainnya"];
export const expenseCategories = [
    "Bahan Baku",
    "Gaji",
    "Sewa",
    "Listrik & Air",
    "Operasional",
    "Marketing",
    "Lainnya",
];

const categoryPalette: Record<string, string> = {
    "Dine-in": "bg-green",
    Takeaway: "bg-blue",
    Delivery: "bg-purple",
    Catering: "bg-aqua",
    "Bahan Baku": "bg-orange",
    Gaji: "bg-red",
    Sewa: "bg-purple",
    "Listrik & Air": "bg-yellow",
    Operasional: "bg-blue",
    Marketing: "bg-aqua",
    Lainnya: "bg-lavender",
};

export interface Entry {
    id: string;
    type: EntryType;
    date: string;
    category: string;
    description: string;
    amount: number;
    outletId: string;
}

export const makeEntryId = () => Math.random().toString(36).slice(2, 10);

export const categoriesFor = (type: EntryType): string[] =>
    type === "income" ? [...incomeCategories] : [...expenseCategories];

export const categoryColor = (category: string): string => categoryPalette[category] ?? "bg-lavender";

export const typeLabel = (type: EntryType) => (type === "income" ? "Pendapatan" : "Pengeluaran");

export function isoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function dateOffset(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return isoDate(date);
}

export function rupiahShort(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
    if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} jt`;
    if (abs >= 1_000) return `Rp ${Math.round(value / 1_000)} rb`;
    return `Rp ${value}`;
}

function rng(seed: number) {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function generate(outletId: string, seed: number): Entry[] {
    const rand = rng(seed);
    const entries: Entry[] = [];
    let counter = 1;
    const nextId = (prefix: string) => `ACC-${outletId.slice(0, 3).toUpperCase()}-${prefix}${String(counter++).padStart(4, "0")}`;

    for (let offset = 44; offset >= 0; offset--) {
        const date = dateOffset(offset);
        const day = new Date(date).getDate();

        const incomeCount = 1 + Math.floor(rand() * 3);
        for (let index = 0; index < incomeCount; index++) {
            const category = incomeCategories[Math.floor(rand() * incomeCategories.length)];
            entries.push({
                id: nextId("IN"),
                type: "income",
                date,
                category,
                description: `Penjualan ${category}`,
                amount: 1_500_000 + Math.floor(rand() * 2_500_000),
                outletId,
            });
        }

        entries.push({
            id: nextId("EX"),
            type: "expense",
            date,
            category: "Bahan Baku",
            description: "Belanja bahan harian",
            amount: 400_000 + Math.floor(rand() * 600_000),
            outletId,
        });

        if (rand() > 0.65) {
            entries.push({
                id: nextId("EX"),
                type: "expense",
                date,
                category: "Operasional",
                description: "Operasional harian",
                amount: 100_000 + Math.floor(rand() * 300_000),
                outletId,
            });
        }
        if (rand() > 0.85) {
            entries.push({
                id: nextId("EX"),
                type: "expense",
                date,
                category: "Marketing",
                description: "Promosi online",
                amount: 150_000 + Math.floor(rand() * 450_000),
                outletId,
            });
        }
        if (day === 1) {
            entries.push({
                id: nextId("EX"),
                type: "expense",
                date,
                category: "Sewa",
                description: "Sewa tempat bulanan",
                amount: 4_000_000 + Math.floor(rand() * 1_500_000),
                outletId,
            });
            entries.push({
                id: nextId("EX"),
                type: "expense",
                date,
                category: "Gaji",
                description: "Gaji karyawan bulanan",
                amount: 7_000_000 + Math.floor(rand() * 3_000_000),
                outletId,
            });
        }
        if (day === 5) {
            entries.push({
                id: nextId("EX"),
                type: "expense",
                date,
                category: "Listrik & Air",
                description: "Tagihan listrik & air",
                amount: 900_000 + Math.floor(rand() * 700_000),
                outletId,
            });
        }
    }

    return entries;
}

export const seedEntries: Entry[] = [...generate("sudirman", 4242), ...generate("kemang", 9191)];

export type Period = "month" | "30d" | "all";

export function periodRange(period: Period): { from: string; to: string } | null {
    if (period === "all") return null;
    const today = new Date();
    const from = new Date(today);
    if (period === "month") {
        from.setDate(1);
    } else {
        from.setDate(today.getDate() - 29);
    }
    return { from: isoDate(from), to: isoDate(today) };
}

export function inPeriod(entry: Entry, range: { from: string; to: string } | null): boolean {
    if (!range) return true;
    return entry.date >= range.from && entry.date <= range.to;
}

export function summarize(entries: Entry[]) {
    const income = entries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0);
    const expense = entries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
    const net = income - expense;
    return { income, expense, net, margin: income > 0 ? (net / income) * 100 : 0 };
}

export function byCategory(entries: Entry[], type: EntryType): { label: string; value: number }[] {
    const map = new Map<string, number>();
    for (const entry of entries.filter((candidate) => candidate.type === type)) {
        map.set(entry.category, (map.get(entry.category) ?? 0) + entry.amount);
    }
    return [...map.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
}

export function dailyTrend(entries: Entry[], days: number): { date: string; income: number; expense: number }[] {
    const result: { date: string; income: number; expense: number }[] = [];
    for (let offset = days - 1; offset >= 0; offset--) {
        const date = dateOffset(offset);
        const dayEntries = entries.filter((entry) => entry.date === date);
        result.push({
            date,
            income: dayEntries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0),
            expense: dayEntries
                .filter((entry) => entry.type === "expense")
                .reduce((sum, entry) => sum + entry.amount, 0),
        });
    }
    return result;
}
