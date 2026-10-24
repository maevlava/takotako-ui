import { useState, type ReactNode } from "react";
import { formatRupiah, totalStock, type Ingredient } from "../../data/ingredients";
import { inPeriod, periodRange, type Entry, type Period } from "../../data/accounting";
import { computeInventoryAccounting } from "../../data/finance";
import { useIngredients } from "../../hooks/useIngredients";
import { useMenus } from "../../hooks/useMenus";
import { useOrders } from "../../hooks/useOrders";
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

export default function InventoryAccounting({ entries }: { entries: Entry[] }) {
    const [period, setPeriod] = useState<Period>("month");
    const { items: ingredients } = useIngredients();
    const { menus } = useMenus();
    const { orders } = useOrders();

    const range = periodRange(period);
    const periodEntries = entries.filter((entry) => inPeriod(entry, range));
    const periodOrders = orders.filter((order) => !range || (order.date >= range.from && order.date <= range.to));
    const inv = computeInventoryAccounting({ ingredients, orders: periodOrders, menus, periodEntries });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Inventory Accounting</span>
                <PeriodTabs value={period} onChange={setPeriod} />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <Card title="Pergerakan Persediaan">
                    <MetricRow
                        label="Beginning Inventory"
                        value={formatRupiah(inv.beginning)}
                        hint="Persediaan awal = Akhir − Pembelian + HPP"
                    />
                    <MetricRow label="Purchases" value={formatRupiah(inv.purchases)} accent="text-blue" hint="Belanja bahan (Bahan Baku)" />
                    <MetricRow label="COGS" value={`- ${formatRupiah(inv.cogs)}`} accent="text-red" hint="HPP dari penjualan (resep × qty)" />
                    <MetricRow label="Ending Inventory" value={formatRupiah(inv.ending)} accent="text-green" strong hint="Nilai persediaan sekarang" />
                    <MetricRow label="Stock Opname" value={formatRupiah(inv.opname)} hint="Nilai hasil hitung fisik" />
                    <MetricRow label="Inventory Adjustment" value={formatRupiah(inv.adjustment)} hint="Koreksi/selisih" />
                </Card>

                <Card title="Ringkasan Nilai">
                    <MetricRow label="Inventory Value" value={formatRupiah(inv.value)} accent="text-green" strong hint="Σ qty batch × harga" />
                    <MetricRow label="Inventory Quantity" value={`${inv.quantity.toLocaleString("id-ID")}`} hint="Total qty (gabungan unit)" />
                    <MetricRow label="Jenis Item" value={`${inv.itemCount}`} />
                    <MetricRow label="Jumlah Batch" value={`${inv.batchCount}`} />
                    <MetricRow label="Unit Cost (weighted)" value={formatRupiah(inv.averageUnitCost)} hint="Nilai ÷ kuantitas" />
                    <MetricRow label="Waste / Spoilage" value={formatRupiah(inv.waste)} accent="text-red" hint="Batch yang sudah kedaluwarsa" />
                    <MetricRow label="Stock Transfer" value={formatRupiah(inv.transfer)} hint="Transfer antar outlet" />
                </Card>
            </div>

            <Card title="Rincian per Item">
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-1.5 text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-faint">
                                <th className="px-3 pb-1">Item</th>
                                <th className="px-3 pb-1 text-right">Qty</th>
                                <th className="px-3 pb-1">Unit</th>
                                <th className="px-3 pb-1 text-right">Unit Cost</th>
                                <th className="px-3 pb-1 text-right">Nilai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients.map((ingredient: Ingredient) => (
                                <tr key={ingredient.id}>
                                    <td className="rounded-l-lg border-y border-l border-border bg-surface px-3 py-2 text-fg">
                                        {ingredient.emoji} {ingredient.name}
                                    </td>
                                    <td className="border-y border-border bg-surface px-3 py-2 text-right text-fg">
                                        {totalStock(ingredient)}
                                    </td>
                                    <td className="border-y border-border bg-surface px-3 py-2 text-muted">
                                        {ingredient.unit}
                                    </td>
                                    <td className="border-y border-border bg-surface px-3 py-2 text-right text-muted">
                                        {formatRupiah(ingredient.price)}
                                    </td>
                                    <td className="rounded-r-lg border-y border-r border-border bg-surface px-3 py-2 text-right font-medium text-green">
                                        {formatRupiah(totalStock(ingredient) * ingredient.price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
