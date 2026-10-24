import { useState, type ReactNode } from "react";
import { formatRupiah } from "../../data/ingredients";
import { byCategory, inPeriod, periodRange, type Entry, type Period } from "../../data/accounting";
import { computeBalanceSheet, computeCash, computeInventoryValue, computePl } from "../../data/finance";
import { useIngredients } from "../../hooks/useIngredients";
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

function CategoryList({ items, total, accent }: { items: { label: string; value: number }[]; total: number; accent: string }) {
    if (items.length === 0) return <p className="text-sm text-faint">Belum ada data.</p>;
    return (
        <div className="flex flex-col gap-1.5">
            {items.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted">{item.label}</span>
                    <span className="flex items-center gap-3">
                        <span className="text-faint">{total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0"}%</span>
                        <span className={`w-28 text-right font-medium ${accent}`}>{formatRupiah(item.value)}</span>
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function FinancialStatements({ entries }: { entries: Entry[] }) {
    const [period, setPeriod] = useState<Period>("month");
    const { items: ingredients } = useIngredients();

    const range = periodRange(period);
    const scoped = entries.filter((entry) => inPeriod(entry, range));

    const pl = computePl(scoped);
    const cash = computeCash(entries, scoped);
    const inventory = computeInventoryValue(ingredients);
    const balance = computeBalanceSheet(cash.balance, inventory, pl);

    const incomeCats = byCategory(scoped, "income");
    const expenseCats = byCategory(scoped, "expense");

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Laporan Keuangan</span>
                <PeriodTabs value={period} onChange={setPeriod} />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <Card title="Laba Rugi (Income Statement)">
                    <MetricRow label="Revenue / Sales" value={formatRupiah(pl.revenue)} accent="text-green" hint="Total pendapatan" />
                    <MetricRow label="COGS / HPP" value={`- ${formatRupiah(pl.cogs)}`} accent="text-red" hint="Harga pokok penjualan (Bahan Baku)" />
                    <MetricRow label="Gross Profit" value={formatRupiah(pl.grossProfit)} accent={pl.grossProfit >= 0 ? "text-green" : "text-red"} strong hint="Laba kotor = Revenue − COGS" />
                    <MetricRow label="Gross Margin" value={`${pl.grossMargin.toFixed(1)}%`} hint="Gross Profit ÷ Revenue" />
                    <MetricRow label="Operating Expenses" value={`- ${formatRupiah(pl.opex)}`} accent="text-red" hint="Gaji, sewa, listrik, operasional, marketing" />
                    <MetricRow label="Operating Profit" value={formatRupiah(pl.operatingProfit)} accent={pl.operatingProfit >= 0 ? "text-green" : "text-red"} strong hint="Gross Profit − Opex" />
                    <MetricRow label="Net Profit" value={formatRupiah(pl.netProfit)} accent={pl.netProfit >= 0 ? "text-green" : "text-red"} strong hint="Laba bersih (sebelum pajak)" />
                    <MetricRow label="Net Margin" value={`${pl.netMargin.toFixed(1)}%`} hint="Net Profit ÷ Revenue" />
                </Card>

                <Card title="Arus Kas (Cash Flow)">
                    <MetricRow label="Cash Inflow" value={formatRupiah(cash.inflow)} accent="text-green" hint="Uang masuk (penjualan)" />
                    <MetricRow label="Cash Outflow" value={`- ${formatRupiah(cash.outflow)}`} accent="text-red" hint="Uang keluar (pengeluaran)" />
                    <MetricRow label="Net Cash Flow" value={formatRupiah(cash.net)} accent={cash.net >= 0 ? "text-green" : "text-red"} strong hint="Inflow − Outflow" />
                    <MetricRow label="Cash Balance" value={formatRupiah(cash.balance)} accent="text-fg" strong hint="Saldo awal + akumulasi arus kas" />
                    <div className="mt-3 border-t border-border pt-3">
                        <MetricRow label="Saldo awal kas" value={formatRupiah(25_000_000)} hint="Asumsi modal awal" />
                    </div>
                </Card>
            </div>

            <Card title="Neraca (Balance Sheet)">
                <div className="grid gap-x-8 gap-y-1 md:grid-cols-2">
                    <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-green">Aset</p>
                        <MetricRow label="Kas (Cash)" value={formatRupiah(balance.cash)} />
                        <MetricRow label="Piutang (Accounts Receivable)" value={formatRupiah(balance.receivable)} hint="Estimasi 8% dari revenue" />
                        <MetricRow label="Persediaan (Inventory)" value={formatRupiah(balance.inventory)} />
                        <MetricRow label="Total Aset" value={formatRupiah(balance.totalAsset)} strong accent="text-green" />
                    </div>
                    <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-red">Liabilitas & Ekuitas</p>
                        <MetricRow label="Utang (Accounts Payable)" value={formatRupiah(balance.payable)} hint="Estimasi 12% dari COGS" />
                        <MetricRow label="Total Liabilitas" value={formatRupiah(balance.liability)} strong accent="text-red" />
                        <MetricRow label="Ekuitas (Equity)" value={formatRupiah(balance.equity)} strong hint="Aset − Liabilitas" />
                    </div>
                </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
                <Card title="Pendapatan per Kategori">
                    <CategoryList items={incomeCats} total={pl.revenue} accent="text-green" />
                </Card>
                <Card title="Pengeluaran per Kategori">
                    <CategoryList items={expenseCats} total={pl.cogs + pl.opex} accent="text-red" />
                </Card>
            </div>
        </div>
    );
}
