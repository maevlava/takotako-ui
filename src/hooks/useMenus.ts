import { useEffect, useState } from "react";
import { makeMenuId, seedMenus, type MenuItem } from "../data/menus";

const STORAGE_KEY = "tako.menus";

const load = (): MenuItem[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedMenus;
    try {
        return JSON.parse(raw) as MenuItem[];
    } catch {
        return seedMenus;
    }
};

export function useMenus() {
    const [menus, setMenus] = useState<MenuItem[]>(load);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
    }, [menus]);

    const add = (menu: Omit<MenuItem, "id">) => setMenus((prev) => [...prev, { ...menu, id: makeMenuId() }]);
    const update = (id: string, patch: Partial<MenuItem>) =>
        setMenus((prev) => prev.map((menu) => (menu.id === id ? { ...menu, ...patch } : menu)));
    const remove = (id: string) => setMenus((prev) => prev.filter((menu) => menu.id !== id));

    return { menus, add, update, remove };
}
