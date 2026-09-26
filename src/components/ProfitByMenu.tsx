import { formatRupiah, type Ingredient } from "../data/ingredients";
import { menuCost, type MenuItem } from "../data/menus";
import type { Order } from "../data/orders";

interface ProfitRow {
    menuId: string;
    label: string;
    orders: number;
    revenue: number;
    expense: number;
    profit: number;
}

interface ProfitByMenuProps {
    orders: Order[];
    menus: MenuItem[];
    ingredients: Ingredient[];
}

export default function ProfitByMenu({ orders, menus, ingredients }: ProfitByMenuProps) {
    const map = new Map<string, { label: string; qty: number; revenue: number }>();
    for (const order of orders) {
        for (const item of order.items) {
            const entry = map.get(item.menuId) ?? { label: item.menuName, qty: 0, revenue: 0 };
            entry.qty += item.qty;
            entry.revenue += item.qty * item.price;
            map.set(item.menuId, entry);
        }
    }

    const rows: ProfitRow[] = [...map.entries()]
        .map(([menuId, entry]) => {
            const menu = menus.find((candidate) => candidate.id === menuId);
            const unitCost = menu ? menuCost(menu, ingredients) : 0;
            const expense = unitCost * entry.qty;
            return {
                menuId,
                label: entry.label,
                orders: entry.qty,
                revenue: entry.revenue,
                expense,
                profit: entry.revenue - expense,
            };
        })
        .sort((a, b) => b.profit - a.profit);

    if (rows.length === 0) {
        return <p className="text-sm text-faint">Belum ada data.</p>;
    }

    return (
        <div className="flex flex-col gap-2">
            {rows.map((row) => (
                <div
                    key={row.menuId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
                >
                    <span className="font-medium text-fg">{row.label}</span>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="text-muted">
                            Orders <span className="text-fg">{row.orders}</span>
                        </span>
                        <span className="text-muted">
                            Revenue <span className="text-blue">{formatRupiah(row.revenue)}</span>
                        </span>
                        <span className="text-muted">
                            Expense <span className="text-red">{formatRupiah(row.expense)}</span>
                        </span>
                        <span className="text-muted">
                            Profit <span className="font-semibold text-green">{formatRupiah(row.profit)}</span>
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
