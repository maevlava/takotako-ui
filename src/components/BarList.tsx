interface BarItem {
    label: string;
    value: number;
}

interface BarListProps {
    items: BarItem[];
    accent?: string;
    format?: (value: number) => string;
    labelWidth?: string;
    empty?: string;
}

export default function BarList({
    items,
    accent = "bg-lavender",
    format,
    labelWidth = "w-28",
    empty = "Belum ada data.",
}: BarListProps) {
    if (items.length === 0) {
        return <p className="text-sm text-faint">{empty}</p>;
    }
    const max = Math.max(...items.map((item) => item.value), 1);
    return (
        <div className="flex flex-col gap-2">
            {items.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                    <span className={`${labelWidth} shrink-0 truncate text-sm text-muted`}>{item.label}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface">
                        <div
                            className={`h-full rounded-full ${accent}`}
                            style={{ width: `${(item.value / max) * 100}%` }}
                        />
                    </div>
                    <span className="w-16 shrink-0 text-right text-sm text-fg">
                        {format ? format(item.value) : item.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
