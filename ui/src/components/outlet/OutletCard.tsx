import { Triangle } from "lucide-react";
import { formatRupiah, isImage } from "../../data/ingredients";
import { outletMargin, outletNet, type Outlet, type OutletDelta } from "../../data/outlets";

function Delta({ delta, format }: { delta: OutletDelta; format: (value: number) => string }) {
    if (delta.percent === 0 && delta.value === 0) {
        return <span className="mt-1 inline-block text-xs text-faint">— sama</span>;
    }
    const up = delta.percent >= 0;
    return (
        <span className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${up ? "text-green" : "text-red"}`}>
            <Triangle size={9} className={`fill-current ${up ? "" : "rotate-180"}`} />
            {`${up ? "+" : "-"}${Math.abs(delta.percent)}%`}
            <span className="text-faint">
                ({up ? "+" : "-"}
                {format(Math.abs(delta.value))})
            </span>
        </span>
    );
}

interface MetricProps {
    label: string;
    value: string;
    valueClass: string;
    delta: OutletDelta;
    deltaFormat: (value: number) => string;
}

function Metric({ label, value, valueClass, delta, deltaFormat }: MetricProps) {
    return (
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-faint">{label}</p>
            <p className={`mt-1 text-lg font-semibold ${valueClass}`}>{value}</p>
            <Delta delta={delta} format={deltaFormat} />
        </div>
    );
}

interface OutletCardProps {
    outlet: Outlet;
    onSelect?: () => void;
}

export default function OutletCard({ outlet, onSelect }: OutletCardProps) {
    const net = outletNet(outlet);
    const margin = outletMargin(outlet);

    return (
        <div
            onClick={onSelect}
            className={`flex flex-col rounded-2xl border border-border bg-bg p-5 transition-colors ${
                onSelect ? "cursor-pointer hover:border-lavender" : ""
            }`}
        >
            <div className="flex h-48 items-center justify-center overflow-hidden rounded-xl bg-surface text-7xl">
                {isImage(outlet.image) ? (
                    <img src={outlet.image} alt={outlet.name} className="size-full object-cover" />
                ) : (
                    outlet.image
                )}
            </div>

            <div className="mt-5">
                <h3 className="text-lg font-semibold text-fg">{outlet.name}</h3>
                <p className="text-sm text-muted">{outlet.address}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric
                    label="Total keuntungan"
                    value={formatRupiah(outlet.profit)}
                    valueClass="text-green"
                    delta={outlet.deltas.profit}
                    deltaFormat={formatRupiah}
                />
                <Metric
                    label="Expense"
                    value={formatRupiah(outlet.expense)}
                    valueClass="text-red"
                    delta={outlet.deltas.expense}
                    deltaFormat={formatRupiah}
                />
                <Metric
                    label="Orders"
                    value={outlet.orders.toLocaleString("id-ID")}
                    valueClass="text-blue"
                    delta={outlet.deltas.orders}
                    deltaFormat={(value) => value.toLocaleString("id-ID")}
                />
                <Metric
                    label="Harga sewa"
                    value={formatRupiah(outlet.rent)}
                    valueClass="text-yellow"
                    delta={outlet.deltas.rent}
                    deltaFormat={formatRupiah}
                />
            </div>

            <div className="mt-5 flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-muted">Net setelah beban</span>
                    <span className={`font-semibold ${net >= 0 ? "text-green" : "text-red"}`}>
                        {formatRupiah(net)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted">Margin net</span>
                    <span className="font-medium text-fg">{margin.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    );
}
