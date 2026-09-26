const palette = [
    "bg-lavender",
    "bg-blue",
    "bg-green",
    "bg-yellow",
    "bg-orange",
    "bg-purple",
    "bg-aqua",
    "bg-red",
];

interface Segment {
    label: string;
    value: number;
}

export default function ProportionBar({ items }: { items: Segment[] }) {
    const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

    return (
        <div>
            <div className="flex h-3 overflow-hidden rounded-full bg-surface">
                {items.map((item, index) => (
                    <div
                        key={item.label}
                        className={palette[index % palette.length]}
                        style={{ width: `${(item.value / total) * 100}%` }}
                    />
                ))}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
                {items.map((item, index) => (
                    <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted">
                        <span className={`size-2 rounded-full ${palette[index % palette.length]}`} />
                        {item.label}
                        <span className="text-faint">{Math.round((item.value / total) * 100)}%</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
