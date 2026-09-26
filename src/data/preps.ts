import { lineCost, type Batch, type Ingredient } from "./ingredients";

export interface PrepAllocation {
    batchId: string;
    addedAt: string;
    expiryDays: number;
    qty: number;
    returned: number;
}

export interface PrepItem {
    ingredientId: string;
    ingredientName: string;
    qty: number;
    unit: string;
    returned: number;
    allocations: PrepAllocation[];
}

export interface Prep {
    id: string;
    outletId: string;
    date: string;
    items: PrepItem[];
    createdAt: string;
}

export const makePrepId = () => Math.random().toString(36).slice(2, 10);

export const seedPreps: Prep[] = [];

export function prepCost(prep: Prep, ingredients: Ingredient[]): number {
    return prep.items.reduce((sum, item) => {
        const ingredient =
            ingredients.find((entry) => entry.id === item.ingredientId) ??
            ingredients.find((entry) => entry.name.toLowerCase() === item.ingredientName.toLowerCase());
        return ingredient ? sum + lineCost(ingredient, item.qty, item.unit) : sum;
    }, 0);
}

export function allocateOldest(batches: Batch[], qty: number): { allocations: PrepAllocation[]; batches: Batch[] } {
    const sorted = [...batches].sort((a, b) => a.addedAt.localeCompare(b.addedAt));
    let remaining = qty;
    const allocations: PrepAllocation[] = [];

    const next = sorted.map((batch) => {
        if (remaining <= 0) return batch;
        const take = Math.min(batch.qty, remaining);
        remaining -= take;
        if (take > 0) {
            allocations.push({
                batchId: batch.id,
                addedAt: batch.addedAt,
                expiryDays: batch.expiryDays,
                qty: take,
                returned: 0,
            });
        }
        return { ...batch, qty: batch.qty - take };
    });

    return { allocations, batches: next.filter((batch) => batch.qty > 0) };
}

function addBack(batches: Batch[], allocation: PrepAllocation, amount: number): Batch[] {
    const existing = batches.find((batch) => batch.id === allocation.batchId);
    if (existing) {
        return batches.map((batch) =>
            batch.id === allocation.batchId ? { ...batch, qty: batch.qty + amount } : batch
        );
    }
    return [
        ...batches,
        { id: allocation.batchId, addedAt: allocation.addedAt, expiryDays: allocation.expiryDays, qty: amount },
    ];
}

export function applyReturn(item: PrepItem, qty: number, batches: Batch[]): { item: PrepItem; batches: Batch[] } {
    let remaining = qty;
    let next = batches;
    let applied = 0;

    const allocations = item.allocations.map((allocation) => {
        if (remaining <= 0) return allocation;
        const capacity = allocation.qty - allocation.returned;
        const put = Math.max(0, Math.min(capacity, remaining));
        remaining -= put;
        applied += put;
        if (put > 0) next = addBack(next, allocation, put);
        return { ...allocation, returned: allocation.returned + put };
    });

    return { item: { ...item, returned: item.returned + applied, allocations }, batches: next };
}

export function reverseAllocations(item: PrepItem, batches: Batch[]): Batch[] {
    let next = batches;
    for (const allocation of item.allocations) {
        const back = allocation.qty - allocation.returned;
        if (back > 0) next = addBack(next, allocation, back);
    }
    return next;
}
