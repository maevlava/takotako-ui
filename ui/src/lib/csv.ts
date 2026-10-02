export function downloadCsv(filename: string, rows: (string | number)[][]) {
    const csv = rows
        .map((row) =>
            row
                .map((cell) => {
                    const value = String(cell);
                    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
                })
                .join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export function parseCsv(text: string): string[][] {
    const source = text.replace(/^\ufeff/, "");
    const firstLine = source.split(/\r?\n/, 1)[0] ?? "";
    const counts: [string, number][] = [
        [",", (firstLine.match(/,/g) ?? []).length],
        [";", (firstLine.match(/;/g) ?? []).length],
        ["\t", (firstLine.match(/\t/g) ?? []).length],
    ];
    counts.sort((a, b) => b[1] - a[1]);
    const delimiter = counts[0][1] > 0 ? counts[0][0] : ",";

    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let inQuotes = false;

    for (let index = 0; index < source.length; index++) {
        const char = source[index];
        if (inQuotes) {
            if (char === '"') {
                if (source[index + 1] === '"') {
                    field += '"';
                    index++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
        } else if (char === '"') {
            inQuotes = true;
        } else if (char === delimiter) {
            row.push(field);
            field = "";
        } else if (char === "\n") {
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else if (char !== "\r") {
            field += char;
        }
    }
    if (field !== "" || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    return rows.filter((entry) => entry.some((cell) => cell.trim() !== ""));
}

export function toObjects(rows: string[][]): Record<string, string>[] {
    if (rows.length < 2) return [];
    const header = rows[0].map((cell) => cell.trim().replace(/^\ufeff/, "").toLowerCase());
    return rows.slice(1).map((row) => {
        const object: Record<string, string> = {};
        header.forEach((key, index) => {
            object[key] = (row[index] ?? "").trim();
        });
        return object;
    });
}

export function parseNumber(value: string): number {
    const cleaned = value.trim().replace(/[^\d.,-]/g, "");
    if (cleaned === "") return 0;
    if (cleaned.includes(",")) {
        return Number(cleaned.replace(/\./g, "").replace(",", "."));
    }
    if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) {
        return Number(cleaned.replace(/\./g, ""));
    }
    return Number(cleaned);
}
