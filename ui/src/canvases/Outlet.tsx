import { Canvas } from "../components/common/Canvas";
import OutletCard from "../components/outlet/OutletCard";
import OutletDetail from "../components/outlet/OutletDetail";
import { seedOutlets } from "../data/outlets";

interface OutletProps {
    outletId: string;
    onSelect: (id: string) => void;
}

export default function Outlet({ outletId, onSelect }: OutletProps) {
    const selected = outletId === "all" ? null : seedOutlets.find((outlet) => outlet.id === outletId) ?? null;

    if (selected) {
        return <OutletDetail outlet={selected} onBack={() => onSelect("all")} />;
    }

    return (
        <Canvas>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {seedOutlets.map((outlet) => (
                    <OutletCard key={outlet.id} outlet={outlet} onSelect={() => onSelect(outlet.id)} />
                ))}
            </div>
        </Canvas>
    );
}
