import { Canvas } from "../components/Canvas";

export default function Dashboard() {
    return (
        <Canvas>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {["Penjualan", "Pembelian", "Laba", "Stok"].map((card) => (
                    <div key={card} className="rounded-xl border border-border bg-bg p-4">
                        <p className="text-sm text-muted">{card}</p>
                        <p className="mt-2 text-xl font-semibold text-fg">0</p>
                    </div>
                ))}
            </div>
        </Canvas>
    );
}
