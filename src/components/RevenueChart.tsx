import { useState } from "react";
import { rupiahShort } from "../data/accounting";
import { formatRupiah } from "../data/ingredients";
import type { RevenueBucket } from "../data/revenue";

const WIDTH = 840;
const HEIGHT = 300;
const PAD = { top: 20, right: 24, bottom: 40, left: 76 };
const TOOLTIP_WIDTH = 156;

export default function RevenueChart({ data }: { data: RevenueBucket[] }) {
    const [active, setActive] = useState<number | null>(null);

    if (data.length === 0) {
        return <p className="py-16 text-center text-sm text-faint">Belum ada data.</p>;
    }

    const innerW = WIDTH - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const top = Math.max(...data.map((bucket) => bucket.value), 1) * 1.15;
    const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
    const baseY = PAD.top + innerH;
    const xAt = (index: number) => PAD.left + index * stepX;
    const yAt = (value: number) => PAD.top + innerH - (value / top) * innerH;

    const line = data
        .map((bucket, index) => `${index === 0 ? "M" : "L"} ${xAt(index)} ${yAt(bucket.value)}`)
        .join(" ");
    const area = `${line} L ${xAt(data.length - 1)} ${baseY} L ${xAt(0)} ${baseY} Z`;
    const ticks = [0, 0.25, 0.5, 0.75, 1];
    const labelStep = Math.ceil(data.length / 7);
    const bucket = active === null ? null : data[active];
    const tooltipX = bucket ? Math.min(Math.max(xAt(active as number) - TOOLTIP_WIDTH / 2, PAD.left), WIDTH - PAD.right - TOOLTIP_WIDTH) : 0;
    const tooltipY = bucket ? Math.max(yAt(bucket.value) - 58, 4) : 0;

    return (
        <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full"
            role="img"
            aria-label="Grafik tren penjualan"
            onMouseLeave={() => setActive(null)}
        >
            <defs>
                <linearGradient id="revenue-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-lavender)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--color-lavender)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="revenue-line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-blue)" />
                    <stop offset="100%" stopColor="var(--color-lavender)" />
                </linearGradient>
            </defs>

            {ticks.map((ratio) => {
                const y = PAD.top + innerH - ratio * innerH;
                return (
                    <g key={ratio}>
                        <line
                            x1={PAD.left}
                            y1={y}
                            x2={WIDTH - PAD.right}
                            y2={y}
                            stroke="var(--color-border)"
                            strokeOpacity="0.4"
                            strokeDasharray={ratio === 0 ? undefined : "4 6"}
                        />
                        <text x={PAD.left - 10} y={y + 4} textAnchor="end" className="fill-faint text-[11px]">
                            {rupiahShort(top * ratio)}
                        </text>
                    </g>
                );
            })}

            {data.map((item, index) =>
                index % labelStep === 0 || index === data.length - 1 ? (
                    <text
                        key={item.label}
                        x={xAt(index)}
                        y={HEIGHT - 14}
                        textAnchor="middle"
                        className="fill-faint text-[11px]"
                    >
                        {item.label}
                    </text>
                ) : null
            )}

            <path d={area} fill="url(#revenue-area)" />
            <path
                d={line}
                fill="none"
                stroke="url(#revenue-line)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {bucket && active !== null && (
                <g>
                    <line
                        x1={xAt(active)}
                        y1={PAD.top}
                        x2={xAt(active)}
                        y2={baseY}
                        stroke="var(--color-lavender)"
                        strokeOpacity="0.5"
                        strokeDasharray="4 4"
                    />
                    <circle
                        cx={xAt(active)}
                        cy={yAt(bucket.value)}
                        r="5"
                        fill="var(--color-lavender)"
                        stroke="var(--color-bg)"
                        strokeWidth="2"
                    />
                    <g transform={`translate(${tooltipX} ${tooltipY})`}>
                        <rect width={TOOLTIP_WIDTH} height="52" rx="10" fill="var(--color-surface)" stroke="var(--color-border)" />
                        <text x="12" y="21" className="fill-muted text-[11px]">
                            {bucket.label}
                        </text>
                        <text x="12" y="40" className="fill-fg text-[13px] font-semibold">
                            {formatRupiah(bucket.value)}
                        </text>
                    </g>
                </g>
            )}

            {data.map((item, index) => {
                const width = data.length > 1 ? stepX : innerW;
                const startX = data.length > 1 ? xAt(index) - stepX / 2 : PAD.left;
                return (
                    <rect
                        key={item.label}
                        x={startX}
                        y={PAD.top}
                        width={width}
                        height={innerH}
                        fill="transparent"
                        onMouseEnter={() => setActive(index)}
                    />
                );
            })}
        </svg>
    );
}
