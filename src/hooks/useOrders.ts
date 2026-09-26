import { useEffect, useState } from "react";
import { seedOrders, type Order } from "../data/orders";

const STORAGE_KEY = "tako.orders";

const load = (): Order[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedOrders;
    try {
        return JSON.parse(raw) as Order[];
    } catch {
        return seedOrders;
    }
};

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>(load);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }, [orders]);

    const update = (id: string, patch: Partial<Order>) =>
        setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, ...patch } : order)));
    const remove = (id: string) => setOrders((prev) => prev.filter((order) => order.id !== id));

    return { orders, update, remove };
}
