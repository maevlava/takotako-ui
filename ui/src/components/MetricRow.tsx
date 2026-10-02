interface MetricRowProps {
    label: string;
    value: string;
    hint?: string;
    accent?: string;
    strong?: boolean;
}

export default function MetricRow({ label, value, hint, accent = "text-fg", strong }: MetricRowProps) {
    return (
        <div className="flex items-start justify-between gap-4 py-1.5">
            <div className="min-w-0">
                <p className={`text-sm ${strong ? "font-medium text-fg" : "text-muted"}`}>{label}</p>
                {hint && <p className="text-xs text-faint">{hint}</p>}
            </div>
            <span className={`shrink-0 text-right ${strong ? "text-base font-semibold" : "text-sm font-medium"} ${accent}`}>
                {value}
            </span>
        </div>
    );
}
