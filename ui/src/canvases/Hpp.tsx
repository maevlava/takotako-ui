import { useState } from "react";
import { Canvas } from "../components/common/Canvas";
import IngredientsTable from "../components/hpp/IngredientsTable";
import MenusGrid from "../components/hpp/MenusGrid";

const sections = ["Menus", "Ingredients"] as const;
type Section = (typeof sections)[number];

export default function Hpp() {
    const [section, setSection] = useState<Section>("Ingredients");

    return (
        <Canvas>
            <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg p-1">
                {sections.map((item) => (
                    <button
                        key={item}
                        onClick={() => setSection(item)}
                        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                            section === item ? "bg-surface-hover text-yellow" : "text-muted hover:text-fg"
                        }`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {section === "Ingredients" ? (
                <IngredientsTable />
            ) : (
                <MenusGrid />
            )}
        </Canvas>
    );
}
