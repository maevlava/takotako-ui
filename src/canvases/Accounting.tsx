import { useState } from "react";
import { Canvas } from "../components/Canvas";
import AccountingSummary from "../components/AccountingSummary";
import EntriesTable from "../components/EntriesTable";
import ProfitLoss from "../components/ProfitLoss";
import { useAccounting } from "../hooks/useAccounting";

const sections = ["Ringkasan", "Pendapatan", "Pengeluaran", "Laba Rugi"] as const;
type Section = (typeof sections)[number];

export default function Accounting() {
    const { entries, add, update, remove } = useAccounting();
    const [section, setSection] = useState<Section>("Ringkasan");

    return (
        <Canvas>
            <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-bg p-1">
                {sections.map((item) => (
                    <button
                        key={item}
                        onClick={() => setSection(item)}
                        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                            section === item ? "bg-surface-hover text-purple" : "text-muted hover:text-fg"
                        }`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            <div className="mt-5">
                {section === "Ringkasan" && <AccountingSummary entries={entries} />}
                {section === "Pendapatan" && (
                    <EntriesTable
                        type="income"
                        entries={entries}
                        onAdd={add}
                        onUpdate={update}
                        onDelete={remove}
                    />
                )}
                {section === "Pengeluaran" && (
                    <EntriesTable
                        type="expense"
                        entries={entries}
                        onAdd={add}
                        onUpdate={update}
                        onDelete={remove}
                    />
                )}
                {section === "Laba Rugi" && <ProfitLoss entries={entries} />}
            </div>
        </Canvas>
    );
}
