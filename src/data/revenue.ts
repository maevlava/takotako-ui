import { isoDate } from "./accounting";
import { seedOutlets, type Outlet } from "./outlets";

export type Timeframe = "daily" | "weekly" | "monthly" | "yearly";

export interface RevenuePoint {
    date: string;
    revenue: number;
}

export interface RevenueBucket {
    label: string;
    value: number;
}

export interface OutletRevenue {
    outlet: Outlet;
    points: RevenuePoint[];
}

const DAY_MS = 86_400_000;
const HISTORY_DAYS = 1095;
const AVG_TICKET = 30_000;

const monthShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function rng(seed: number) {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function parse(date: string): Date {
    return new Date(`${date}T00:00:00`);
}

function shortDay(date: string): string {
    const value = parse(date);
    return `${value.getDate()} ${monthShort[value.getMonth()]}`;
}

function weekStart(date: string): string {
    const value = parse(date);
    const offset = (value.getDay() + 6) % 7;
    value.setDate(value.getDate() - offset);
    return isoDate(value);
}

function generate(outlet: Outlet, seed: number): RevenuePoint[] {
    const rand = rng(seed);
    const base = (outlet.orders * AVG_TICKET) / 30;
    const points: RevenuePoint[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let offset = HISTORY_DAYS; offset >= 0; offset--) {
        const date = new Date(today.getTime() - offset * DAY_MS);
        const day = date.getDay();
        const growth = 0.8 + 0.2 * ((HISTORY_DAYS - offset) / HISTORY_DAYS);
        const weekend = day === 0 || day === 5 || day === 6 ? 1.22 : 1;
        const noise = 0.85 + rand() * 0.3;
        points.push({ date: isoDate(date), revenue: Math.round(base * growth * weekend * noise) });
    }

    return points;
}

export const outletRevenues: OutletRevenue[] = seedOutlets.map((outlet, index) => ({
    outlet,
    points: generate(outlet, 1000 + index * 7919),
}));

export function combineRevenue(series: OutletRevenue[]): RevenuePoint[] {
    const map = new Map<string, number>();
    for (const entry of series) {
        for (const point of entry.points) {
            map.set(point.date, (map.get(point.date) ?? 0) + point.revenue);
        }
    }
    return [...map.entries()]
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

function group(
    points: RevenuePoint[],
    keyOf: (date: string) => string,
    labelOf: (key: string) => string
): RevenueBucket[] {
    const map = new Map<string, number>();
    for (const point of points) {
        const key = keyOf(point.date);
        map.set(key, (map.get(key) ?? 0) + point.revenue);
    }
    return [...map.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => ({ label: labelOf(key), value }));
}

export function aggregate(points: RevenuePoint[], timeframe: Timeframe): RevenueBucket[] {
    switch (timeframe) {
        case "daily":
            return group(points, (date) => date, shortDay).slice(-30);
        case "weekly":
            return group(points, weekStart, shortDay).slice(-12);
        case "monthly":
            return group(
                points,
                (date) => date.slice(0, 7),
                (key) => `${monthShort[Number(key.slice(5, 7)) - 1]} '${key.slice(2, 4)}`
            ).slice(-12);
        case "yearly":
            return group(
                points,
                (date) => date.slice(0, 4),
                (key) => key
            ).slice(-4);
        default:
            return [];
    }
}

export function revenueTotal(points: RevenuePoint[], timeframe: Timeframe): number {
    return aggregate(points, timeframe).reduce((sum, bucket) => sum + bucket.value, 0);
}
