import type { Period } from "../data/accounting";

const periods: { id: Period; label: string }[] = [
    { id: "month", label: "Bulan ini" },
    { id: "30d", label: "30 hari" },
    { id: "all", label: "Semua" },
];

export default function PeriodTabs({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
    return (
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg p-1">
            {periods.map((item) => (
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
