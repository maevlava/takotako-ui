import { useState } from "react";
import { formatRupiah } from "../data/ingredients";
import { byCategory, dailyTrend, inPeriod, periodRange, summarize, type Entry, type Period } from "../data/accounting";
import ProportionBar from "./ProportionBar";
import PeriodTabs from "./PeriodTabs";

function Trend({ data }: { data: { date: string; income: number; expense: number }[] }) {
    const max = Math.max(...data.flatMap((item) => [item.income, item.expense]), 1);
    return (
        <div>
            <div className="flex items-end gap-1.5 overflow-x-auto pb-1">
                {data.map((item) => (
                    <div key={item.date} className="flex min-w-6 flex-1 flex-col items-center gap-1">
                        <div className="flex h-28 w-full items-end justify-center gap-0.5">
                            <div
                                className="w-1/2 rounded-t bg-green"
                                style={{ height: `${(item.income / max) * 100}%` }}
                            />
                            <div className="w-1/2 rounded-t bg-red" style={{ height: `${(item.expense / max) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-faint">{item.date.slice(8, 10)}</span>
                    </div>
                ))}
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-green" /> Pendapatan
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-red" /> Pengeluaran
                </span>
            </div>
        </div>
    );
}

function Kpi({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
    return (
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-faint">{label}</p>
            <p className={`mt-1 text-xl font-semibold ${valueClass}`}>{value}</p>
        </div>
    );
}

export default function AccountingSummary({ entries }: { entries: Entry[] }) {
    const [period, setPeriod] = useState<Period>("month");
    const range = periodRange(period);
    const scoped = entries.filter((entry) => inPeriod(entry, range));
    const stats = summarize(scoped);
    const incomeCats = byCategory(scoped, "income");
    const expenseCats = byCategory(scoped, "expense");
    const trendDays = period === "month" ? new Date().getDate() : period === "30d" ? 30 : 14;
    const trend = dailyTrend(entries, trendDays);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end">
                <PeriodTabs value={period} onChange={setPeriod} />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi label="Pendapatan" value={formatRupiah(stats.income)} valueClass="text-green" />
                <Kpi label="Pengeluaran" value={formatRupiah(stats.expense)} valueClass="text-red" />
                <Kpi
                    label="Laba Bersih"
                    value={formatRupiah(stats.net)}
                    valueClass={stats.net >= 0 ? "text-green" : "text-red"}
                />
                <Kpi label="Margin" value={`${stats.margin.toFixed(1)}%`} valueClass="text-fg" />
            </div>

            <div className="rounded-2xl border border-border bg-bg p-5">
                <p className="mb-4 text-xs uppercase tracking-wide text-faint">Tren Harian</p>
                <Trend data={trend} />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-border bg-bg p-5">
                    <p className="mb-4 text-xs uppercase tracking-wide text-faint">Pendapatan per Kategori</p>
                    <ProportionBar items={incomeCats} />
                </div>
                <div className="rounded-2xl border border-border bg-bg p-5">
                    <p className="mb-4 text-xs uppercase tracking-wide text-faint">Pengeluaran per Kategori</p>
                    <ProportionBar items={expenseCats} />
                </div>
            </div>
        </div>
    );
}
