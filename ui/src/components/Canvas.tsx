import type { ReactNode } from "react";

interface CanvasProps {
    children?: ReactNode;
}

export function Canvas({ children }: CanvasProps) {
    return <div>{children ?? <div className="h-64 rounded-xl border border-dashed border-border bg-bg" />}</div>;
}

export default Canvas;
