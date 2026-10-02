import { useState, type ReactNode } from "react";
import { formatRupiah } from "../data/ingredients";
import { inPeriod, periodRange, type Entry, type Period } from "../data/accounting";
import { computeUnitEconomics } from "../data/finance";
import { useIngredients } from "../hooks/useIngredients";
import { useMenus } from "../hooks/useMenus";
import { useOrders } from "../hooks/useOrders";
import MetricRow from "./MetricRow";
import PeriodTabs from "./PeriodTabs";

function Card({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-border bg-bg p-5 ${className}`}>
            <p className="mb-3 text-xs uppercase tracking-wide text-faint">{title}</p>
            {children}
        </div>
    );
}

export default function UnitEconomics({ entries }: { entries: Entry[] }) {
    const [period, setPeriod] = useState<Period>("month");
    const { items: ingredients } = useIngredients();
    const { menus } = useMenus();
    const { orders } = useOrders();

    const range = periodRange(period);
    const periodEntries = entries.filter((entry) => inPeriod(entry, range));
    const periodOrders = orders.filter((order) => !range || (order.date >= range.from && order.date <= range.to));
    const ue = computeUnitEconomics({ orders: periodOrders, menus, ingredients, periodEntries });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Unit Economics</span>
                <PeriodTabs value={period} onChange={setPeriod} />
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Card title="Harga & Biaya per Unit">
                    <MetricRow label="Selling Price" value={formatRupiah(ue.sellingPrice)} accent="text-green" hint="Rata-rata harga jual / unit" />
                    <MetricRow label="Variable Cost" value={formatRupiah(ue.variableCost)} accent="text-red" hint="HPP per unit (resep)" />
                    <MetricRow label="Contribution Margin" value={formatRupiah(ue.contributionMargin)} accent={ue.contributionMargin >= 0 ? "text-green" : "text-red"} strong hint="Selling Price − Variable Cost" />
                    <MetricRow label="Contribution Margin %" value={`${ue.contributionMarginPct.toFixed(1)}%`} hint="CM ÷ Selling Price" />
                    <MetricRow label="Profit per Unit" value={formatRupiah(ue.profitPerUnit)} accent="text-green" strong />
                </Card>

                <Card title="Fixed Cost & BEP">
                    <MetricRow label="Fixed Cost" value={formatRupiah(ue.fixedCost)} accent="text-red" hint="Gaji + sewa + listrik (periode)" />
                    <MetricRow label="Break Even Point (unit)" value={ue.breakEvenUnits.toFixed(0)} strong hint="Fixed Cost ÷ CM" />
                    <MetricRow label="Break Even Point (Rp)" value={formatRupiah(ue.breakEvenRupiah)} strong hint="Fixed Cost ÷ CM%" />
                </Card>

                <Card title="Per Order">
                    <MetricRow label="Average Order Value" value={formatRupiah(ue.averageOrderValue)} accent="text-green" hint="Revenue ÷ jumlah order" />
                    <MetricRow label="Cost per Order" value={formatRupiah(ue.costPerOrder)} accent="text-red" hint="Total HPP ÷ jumlah order" />
                    <MetricRow label="Jumlah Order" value={ue.orderCount.toLocaleString("id-ID")} />
                    <MetricRow label="Unit Terjual" value={ue.unitsSold.toLocaleString("id-ID")} />
                </Card>
            </div>

            <div className="rounded-2xl border border-border bg-bg p-5 text-xs text-faint">
                Catatan: angka bersifat contoh. Selling price = rata-rata, variable cost dari resep menu, fixed cost dari
                kategori Gaji/Sewa/Listrik. Break even point memakai asumsi seluruh penjualan pada harga rata-rata.
            </div>
        </div>
    );
}
