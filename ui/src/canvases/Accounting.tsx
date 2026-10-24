import { useState } from "react";
import { Canvas } from "../components/common/Canvas";
import AccountingSummary from "../components/accounting/AccountingSummary";
import EntriesTable from "../components/accounting/EntriesTable";
import FinancialStatements from "../components/accounting/FinancialStatements";
import InventoryAccounting from "../components/accounting/InventoryAccounting";
import UnitEconomics from "../components/accounting/UnitEconomics";
import { useAccounting } from "../hooks/useAccounting";
import type { Entry } from "../data/accounting";

const sections = ["Ringkasan", "Pendapatan", "Pengeluaran", "Laba Rugi", "Inventory", "Unit Economics"] as const;
type Section = (typeof sections)[number];

export default function Accounting() {
    const { entries, add, update, remove, append, replaceAll } = useAccounting();
    const [section, setSection] = useState<Section>("Ringkasan");

    const handleImport = (items: Entry[], mode: "append" | "replace") => {
        if (mode === "replace") {
            replaceAll(items);
        } else {
            append(items);
        }
    };

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
                        onImport={handleImport}
                    />
                )}
                {section === "Pengeluaran" && (
                    <EntriesTable
                        type="expense"
                        entries={entries}
                        onAdd={add}
                        onUpdate={update}
                        onDelete={remove}
                        onImport={handleImport}
                    />
                )}
                {section === "Laba Rugi" && <FinancialStatements entries={entries} />}
                {section === "Inventory" && <InventoryAccounting entries={entries} />}
                {section === "Unit Economics" && <UnitEconomics entries={entries} />}
            </div>
        </Canvas>
    );
}

