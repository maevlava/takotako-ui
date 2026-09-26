import { useState } from "react";
import { formatRupiah } from "../data/ingredients";
import { byCategory, inPeriod, periodRange, summarize, type Entry, type Period } from "../data/accounting";
import PeriodTabs from "./PeriodTabs";

function Row({ label, value, total, accent }: { label: string; value: number; total: number; accent: string }) {
    const pct = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{label}</span>
            <span className="flex items-center gap-3">
                <span className="text-faint">{pct.toFixed(1)}%</span>
                <span className={`w-28 text-right font-medium ${accent}`}>{formatRupiah(value)}</span>
            </span>
        </div>
    );
}

export default function ProfitLoss({ entries }: { entries: Entry[] }) {
    const [period, setPeriod] = useState<Period>("month");
    const range = periodRange(period);
    const scoped = entries.filter((entry) => inPeriod(entry, range));
    const stats = summarize(scoped);
    const incomeCats = byCategory(scoped, "income");
    const expenseCats = byCategory(scoped, "expense");

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Laporan Laba Rugi</span>
                <PeriodTabs value={period} onChange={setPeriod} />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-border bg-bg p-5">
                    <p className="mb-4 text-xs uppercase tracking-wide text-faint">Pendapatan</p>
                    <div className="flex flex-col gap-2">
                        {incomeCats.map((item) => (
                            <Row
                                key={item.label}
                                label={item.label}
                                value={item.value}
                                total={stats.income}
                                accent="text-green"
                            />
                        ))}
                        {incomeCats.length === 0 && <p className="text-sm text-faint">Belum ada data.</p>}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-sm text-muted">Total Pendapatan</span>
                        <span className="font-semibold text-green">{formatRupiah(stats.income)}</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-bg p-5">
                    <p className="mb-4 text-xs uppercase tracking-wide text-faint">Pengeluaran</p>
                    <div className="flex flex-col gap-2">
                        {expenseCats.map((item) => (
                            <Row
                                key={item.label}
                                label={item.label}
                                value={item.value}
                                total={stats.expense}
                                accent="text-red"
                            />
                        ))}
                        {expenseCats.length === 0 && <p className="text-sm text-faint">Belum ada data.</p>}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-sm text-muted">Total Pengeluaran</span>
                        <span className="font-semibold text-red">{formatRupiah(stats.expense)}</span>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg p-5">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Laba Bersih</span>
                    <span className={`text-xl font-semibold ${stats.net >= 0 ? "text-green" : "text-red"}`}>
                        {formatRupiah(stats.net)}
                    </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm text-muted">Margin</span>
                    <span className="font-medium text-fg">{stats.margin.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    );
}
