import type { Timeframe } from "../../data/revenue";

const timeframes: { id: Timeframe; label: string }[] = [
    { id: "daily", label: "Harian" },
    { id: "weekly", label: "Mingguan" },
    { id: "monthly", label: "Bulanan" },
    { id: "yearly", label: "Tahunan" },
];

export default function TimeframeTabs({
    value,
    onChange,
}: {
    value: Timeframe;
    onChange: (timeframe: Timeframe) => void;
}) {
    return (
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg p-1">
            {timeframes.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onChange(item.id)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        value === item.id ? "bg-surface-hover text-lavender" : "text-muted hover:text-fg"
                    }`}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
