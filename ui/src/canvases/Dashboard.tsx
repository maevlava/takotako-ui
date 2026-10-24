import { useMemo, useState } from "react";
import { Canvas } from "../components/common/Canvas";
import BarList from "../components/dashboard/BarList";
import RevenueChart from "../components/dashboard/RevenueChart";
import TimeframeTabs from "../components/dashboard/TimeframeTabs";
import { formatRupiah } from "../data/ingredients";
import { aggregate, combineRevenue, outletRevenues, type Timeframe } from "../data/revenue";

const rangeLabel: Record<Timeframe, string> = {
    daily: "30 hari terakhir",
    weekly: "12 minggu terakhir",
    monthly: "12 bulan terakhir",
    yearly: "4 tahun terakhir",
};

const unitLabel: Record<Timeframe, string> = {
    daily: "hari",
    weekly: "minggu",
    monthly: "bulan",
    yearly: "tahun",
};

function Stat({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: string }) {
    return (
        <div className="rounded-2xl border border-border bg-bg p-5">
            <p className="text-xs uppercase tracking-wide text-faint">{label}</p>
            <p className={`mt-2 text-xl font-semibold ${accent ?? "text-fg"}`}>{value}</p>
            {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
    );
}

export default function Dashboard() {
    const [timeframe, setTimeframe] = useState<Timeframe>("daily");

    const points = useMemo(() => combineRevenue(outletRevenues), []);
    const data = useMemo(() => aggregate(points, timeframe), [points, timeframe]);

    const total = data.reduce((sum, bucket) => sum + bucket.value, 0);
    const average = data.length > 0 ? total / data.length : 0;
    const peak = data.length > 0 ? Math.max(...data.map((bucket) => bucket.value)) : 0;
    const last = data.at(-1)?.value ?? 0;
    const prev = data.at(-2)?.value ?? 0;
    const growth = prev > 0 ? ((last - prev) / prev) * 100 : 0;

    const byOutlet = outletRevenues
        .map((entry) => ({
            label: entry.outlet.name,
            value: aggregate(entry.points, timeframe).reduce((sum, bucket) => sum + bucket.value, 0),
        }))
        .sort((a, b) => b.value - a.value);

    return (
        <Canvas>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-fg">Dashboard Penjualan</h1>
                    <p className="text-sm text-muted">
                        Revenue dari {outletRevenues.length} outlet · {rangeLabel[timeframe]}
                    </p>
                </div>
                <TimeframeTabs value={timeframe} onChange={setTimeframe} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat
                    label="Total Penjualan"
                    value={formatRupiah(total)}
                    accent="text-green"
                    hint={rangeLabel[timeframe]}
                />
                <Stat
                    label="Rata-rata"
                    value={formatRupiah(average)}
                    accent="text-blue"
                    hint={`per ${unitLabel[timeframe]}`}
                />
                <Stat label="Tertinggi" value={formatRupiah(peak)} accent="text-lavender" hint="periode teratas" />
                <Stat
                    label="Perubahan"
                    value={`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`}
                    accent={growth >= 0 ? "text-green" : "text-red"}
                    hint="vs periode sebelumnya"
                />
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-bg p-5">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-muted">Tren Penjualan</span>
                    <span className="text-xs text-faint">{rangeLabel[timeframe]}</span>
                </div>
                <RevenueChart data={data} />
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-bg p-5">
                <p className="mb-4 text-xs uppercase tracking-wide text-faint">Penjualan per Outlet</p>
                <BarList items={byOutlet} accent="bg-lavender" format={formatRupiah} labelWidth="w-36" />
            </div>
        </Canvas>
    );
}
