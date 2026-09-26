import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

interface SortHeaderProps {
    label: string;
    active: boolean;
    dir: "asc" | "desc";
    onToggle: () => void;
}

export default function SortHeader({ label, active, dir, onToggle }: SortHeaderProps) {
    return (
        <button
            onClick={onToggle}
            className={`flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-fg ${
                active ? "text-fg" : ""
            }`}
        >
            {label}
            {active ? (
                dir === "asc" ? (
                    <ChevronUp size={14} />
                ) : (
                    <ChevronDown size={14} />
                )
            ) : (
                <ArrowUpDown size={14} className="opacity-40" />
            )}
        </button>
    );
}
