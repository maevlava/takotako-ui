import { parseNumber } from "../lib/csv";
import {
    categories,
    makeBatch,
    makeId,
    type Category,
    type Ingredient,
} from "./ingredients";
import {
    type AgeGroup,
    type Gender,
    type Order,
    type OrderItem,
    type OrderMethod,
    orderMenus,
} from "./orders";
import { makeEntryId, type Entry } from "./accounting";
import { seedOutlets } from "./outlets";

export interface ImportResult<T> {
    items: T[];
    errors: string[];
}

const pick = (row: Record<string, string>, ...names: string[]): string => {
    for (const name of names) {
        const value = row[name.toLowerCase()];
        if (value !== undefined && value !== "") return value;
    }
    return "";
};

const matchOutlet = (value: string): string => {
    const target = value.trim().toLowerCase();
    const found =
        seedOutlets.find((outlet) => outlet.id.toLowerCase() === target) ??
        seedOutlets.find((outlet) => outlet.name.toLowerCase() === target);
    return found?.id ?? seedOutlets[0]?.id ?? value;
};

export const accountingTemplate: (string | number)[][] = [
    ["date", "type", "category", "description", "amount", "outlet"],
    ["2026-09-28", "income", "Dine-in", "Penjualan siang", "2500000", "sudirman"],
    ["2026-09-28", "expense", "Bahan Baku", "Belanja sayur", "450000", "sudirman"],
    ["2026-09-28", "expense", "Gaji", "Gaji harian", "300000", "kemang"],
];

export function importAccountingRows(rows: Record<string, string>[]): ImportResult<Entry> {
    const items: Entry[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
        const line = index + 2;
        const date = pick(row, "date", "tanggal");
        const typeRaw = pick(row, "type", "tipe").toLowerCase();
        const type = /^(inc|in|pendapatan|masuk)/.test(typeRaw)
            ? "income"
            : /^(exp|out|pengeluaran|keluar)/.test(typeRaw)
              ? "expense"
              : null;
        const amount = parseNumber(pick(row, "amount", "jumlah", "nominal"));

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            errors.push(`Baris ${line}: tanggal tidak valid (${date || "kosong"}) — pakai YYYY-MM-DD`);
            return;
        }
        if (!type) {
            errors.push(`Baris ${line}: type harus income atau expense`);
            return;
        }
        if (amount === 0) {
            errors.push(`Baris ${line}: amount kosong atau tidak valid`);
            return;
        }

        items.push({
            id: makeEntryId(),
            type,
            date,
            category: pick(row, "category", "kategori") || "Lainnya",
            description: pick(row, "description", "deskripsi", "keterangan"),
            amount,
            outletId: matchOutlet(pick(row, "outlet")),
        });
    });

    return { items, errors };
}

export const ingredientTemplate: (string | number)[][] = [
    ["name", "category", "emoji", "price", "unit", "supplier", "stock", "parLevel", "dailyUsage", "expiryDays"],
    ["Lettuce", "Veggie", "🥬", "5000", "100g", "Pasar Segar", "20", "30", "2", "4"],
    ["Octopus", "Seafood", "🐙", "45000", "kg", "Nelayan Jaya", "5", "40", "1", "3"],
];

export function importIngredientRows(rows: Record<string, string>[]): ImportResult<Ingredient> {
    const items: Ingredient[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
        const line = index + 2;
        const name = pick(row, "name", "nama");
        if (!name) {
            errors.push(`Baris ${line}: name wajib diisi`);
            return;
        }

        const categoryRaw = pick(row, "category", "kategori");
        const category = (categories.find((item) => item.toLowerCase() === categoryRaw.toLowerCase()) ??
            "Veggie") as Category;
        const stock = parseNumber(pick(row, "stock", "stok", "qty"));
        const expiryDays = parseNumber(pick(row, "expiryDays", "expiry", "expiredays")) || 7;
        const parLevel = parseNumber(pick(row, "parLevel", "par"));
        const dailyUsage = parseNumber(pick(row, "dailyUsage", "usage", "pakai"));

        items.push({
            id: makeId(),
            name,
            emoji: pick(row, "emoji") || "🍽️",
            category,
            stock,
            price: parseNumber(pick(row, "price", "harga")),
            unit: pick(row, "unit", "satuan") || "pcs",
            supplier: pick(row, "supplier", "sumber"),
            parLevel: parLevel || undefined,
            dailyUsage: dailyUsage || undefined,
            batches: stock > 0 ? [makeBatch(stock, expiryDays)] : [],
        });
    });

    return { items, errors };
}

export const orderTemplate: (string | number)[][] = [
    [
        "orderId",
        "date",
        "time",
        "outlet",
        "menu",
        "qty",
        "price",
        "method",
        "age",
        "gender",
        "area",
        "repeat",
    ],
    ["ORD-001", "2026-09-28", "12:30", "sudirman", "Takoyaki Original", "2", "25000", "Dine-in", "26-35", "Pria", "Jakarta Selatan", "false"],
    ["ORD-001", "2026-09-28", "12:30", "sudirman", "Corn Dog", "1", "20000", "Dine-in", "26-35", "Pria", "Jakarta Selatan", "false"],
    ["ORD-002", "2026-09-28", "13:10", "kemang", "Okonomiyaki", "1", "35000", "Takeaway", "18-25", "Wanita", "Depok", "true"],
];

export function importOrderRows(rows: Record<string, string>[]): ImportResult<Order> {
    const groups = new Map<string, Record<string, string>[]>();
    rows.forEach((row, index) => {
        const key = pick(row, "orderId", "orderid", "id") || `row-${index}`;
        const list = groups.get(key) ?? [];
        list.push(row);
        groups.set(key, list);
    });

    const items: Order[] = [];
    const errors: string[] = [];
    let counter = 1;

    for (const [orderId, group] of groups) {
        const first = group[0];
        const date = pick(first, "date", "tanggal");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            errors.push(`Order ${orderId}: tanggal tidak valid (${date || "kosong"})`);
            continue;
        }

        const orderItems: OrderItem[] = [];
        for (const row of group) {
            const menuName = pick(row, "menu");
            if (!menuName) continue;
            const menu = orderMenus.find((candidate) => candidate.name.toLowerCase() === menuName.toLowerCase());
            const qty = parseNumber(pick(row, "qty", "jumlah")) || 1;
            const price = parseNumber(pick(row, "price", "harga")) || menu?.price || 0;
            const menuId = menu?.id ?? menuName.toLowerCase().replace(/\s+/g, "-");
            const existing = orderItems.find((item) => item.menuId === menuId);
            if (existing) {
                existing.qty += qty;
            } else {
                orderItems.push({ menuId, menuName: menu?.name ?? menuName, qty, price });
            }
        }

        if (orderItems.length === 0) {
            errors.push(`Order ${orderId}: tidak ada item valid`);
            continue;
        }

        items.push({
            id: `IMP-${String(counter++).padStart(5, "0")}`,
            outletId: matchOutlet(pick(first, "outlet")),
            date,
            time: pick(first, "time", "jam") || "12:00",
            method: (pick(first, "method", "metode") || "Dine-in") as OrderMethod,
            age: (pick(first, "age", "usia") || "26-35") as AgeGroup,
            gender: (pick(first, "gender", "jenis_kelamin") || "Pria") as Gender,
            area: pick(first, "area") || "Jakarta Selatan",
            repeat: /^(true|1|ya|yes)$/i.test(pick(first, "repeat", "tipe")),
            items: orderItems,
            total: orderItems.reduce((sum, item) => sum + item.qty * item.price, 0),
        });
    }

    return { items, errors };
}
