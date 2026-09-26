export type AgeGroup = "<18" | "18-25" | "26-35" | "36-45" | "45+";
export type Gender = "Pria" | "Wanita";
export type OrderMethod = "Dine-in" | "Takeaway" | "Delivery";

export interface OrderItem {
    menuId: string;
    menuName: string;
    qty: number;
    price: number;
}

export interface Order {
    id: string;
    outletId: string;
    date: string;
    time: string;
    items: OrderItem[];
    total: number;
    method: OrderMethod;
    age: AgeGroup;
    gender: Gender;
    area: string;
    repeat: boolean;
}

export const ageGroups: AgeGroup[] = ["<18", "18-25", "26-35", "36-45", "45+"];
export const genders: Gender[] = ["Pria", "Wanita"];
export const orderMethods: OrderMethod[] = ["Dine-in", "Takeaway", "Delivery"];
export const areas = ["Jakarta Selatan", "Jakarta Pusat", "Depok", "Tangerang", "Bekasi"];

const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function formatDay(date: string): string {
    const [year, month, day] = date.split("-");
    return `${day} ${months[Number(month) - 1]} ${year}`;
}

function dateOffset(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function rng(seed: number) {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

const menuRefs = [
    { id: "menu-takoyaki-original", name: "Takoyaki Original", price: 25000 },
    { id: "menu-takoyaki-cheese", name: "Takoyaki Cheese", price: 30000 },
    { id: "menu-okonomiyaki", name: "Okonomiyaki", price: 35000 },
    { id: "menu-corn-dog", name: "Corn Dog", price: 20000 },
];

export const orderMenus = menuRefs;

function generate(outletId: string, seed: number): Order[] {
    const rand = rng(seed);
    const dates = [dateOffset(2), dateOffset(1), dateOffset(0)];
    const orders: Order[] = [];
    let counter = 1;

    for (const date of dates) {
        const count = 28 + Math.floor(rand() * 20);
        for (let index = 0; index < count; index++) {
            const hour = 10 + Math.floor(rand() * 12);
            const minute = Math.floor(rand() * 60);
            const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

            const items: OrderItem[] = [];
            const itemCount = 1 + Math.floor(rand() * 3);
            for (let k = 0; k < itemCount; k++) {
                const menu = menuRefs[Math.floor(rand() * menuRefs.length)];
                const qty = 1 + Math.floor(rand() * 3);
                const existing = items.find((item) => item.menuId === menu.id);
                if (existing) {
                    existing.qty += qty;
                } else {
                    items.push({ menuId: menu.id, menuName: menu.name, qty, price: menu.price });
                }
            }

            orders.push({
                id: `${outletId.toUpperCase()}-${date.replace(/-/g, "")}-${String(counter++).padStart(4, "0")}`,
                outletId,
                date,
                time,
                items,
                total: items.reduce((sum, item) => sum + item.qty * item.price, 0),
                method: orderMethods[Math.floor(rand() * orderMethods.length)],
                age: ageGroups[Math.floor(rand() * ageGroups.length)],
                gender: genders[Math.floor(rand() * genders.length)],
                area: areas[Math.floor(rand() * areas.length)],
                repeat: rand() > 0.4,
            });
        }
    }

    return orders;
}

export const seedOrders: Order[] = [...generate("sudirman", 12345), ...generate("kemang", 67890)];

export function ordersForOutlet(outletId: string): Order[] {
    return seedOrders.filter((order) => order.outletId === outletId);
}

export function availableDates(orders: Order[]): string[] {
    return [...new Set(orders.map((order) => order.date))].sort((a, b) => b.localeCompare(a));
}

export function ordersByMenu(orders: Order[]): { id: string; label: string; value: number }[] {
    const map = new Map<string, { label: string; value: number }>();
    for (const order of orders) {
        for (const item of order.items) {
            const entry = map.get(item.menuId) ?? { label: item.menuName, value: 0 };
            entry.value += item.qty;
            map.set(item.menuId, entry);
        }
    }
    return [...map.entries()]
        .map(([id, entry]) => ({ id, label: entry.label, value: entry.value }))
        .sort((a, b) => b.value - a.value);
}

export function ordersByHour(orders: Order[]): { hour: number; label: string; value: number }[] {
    const map = new Map<number, number>();
    for (const order of orders) {
        const hour = Number(order.time.slice(0, 2));
        map.set(hour, (map.get(hour) ?? 0) + 1);
    }
    return [...map.entries()]
        .map(([hour, value]) => ({ hour, label: `${String(hour).padStart(2, "0")}:00`, value }))
        .sort((a, b) => a.hour - b.hour);
}

export function demographics(
    orders: Order[],
    key: "age" | "gender" | "method" | "area"
): { label: string; value: number }[] {
    const map = new Map<string, number>();
    for (const order of orders) {
        const value = String(order[key]);
        map.set(value, (map.get(value) ?? 0) + 1);
    }
    return [...map.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
}
