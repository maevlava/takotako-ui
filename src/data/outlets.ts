export interface OutletDelta {
    percent: number;
    value: number;
}

export interface Outlet {
    id: string;
    name: string;
    address: string;
    image: string;
    profit: number;
    expense: number;
    orders: number;
    rent: number;
    deltas: {
        profit: OutletDelta;
        expense: OutletDelta;
        orders: OutletDelta;
        rent: OutletDelta;
    };
}

export const seedOutlets: Outlet[] = [
    {
        id: "sudirman",
        name: "Tako Sudirman",
        address: "Jl. Jend. Sudirman No. 45, Jakarta",
        image: "🛒",
        profit: 18_500_000,
        expense: 7_200_000,
        orders: 1240,
        rent: 4_500_000,
        deltas: {
            profit: { percent: 12, value: 2_000_000 },
            expense: { percent: -5, value: -380_000 },
            orders: { percent: 8, value: 90 },
            rent: { percent: 0, value: 0 },
        },
    },
    {
        id: "kemang",
        name: "Tako Kemang",
        address: "Jl. Kemang Raya No. 12, Jakarta",
        image: "🏪",
        profit: 9_800_000,
        expense: 3_100_000,
        orders: 720,
        rent: 4_200_000,
        deltas: {
            profit: { percent: -6, value: -650_000 },
            expense: { percent: 9, value: 260_000 },
            orders: { percent: -4, value: -30 },
            rent: { percent: 0, value: 0 },
        },
    },
];

export function outletNet(outlet: Outlet): number {
    return outlet.profit - outlet.expense - outlet.rent;
}

export function outletMargin(outlet: Outlet): number {
    return outlet.profit > 0 ? (outletNet(outlet) / outlet.profit) * 100 : 0;
}
