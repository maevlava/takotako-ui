import type { Entry } from "./accounting";
import { totalStock, unitBase, type Ingredient } from "./ingredients";
import { menuCost, type MenuItem } from "./menus";
import type { Order } from "./orders";

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const OPENING_CASH = 25_000_000;

const income = (entries: Entry[]) => entries.filter((entry) => entry.type === "income");
const expense = (entries: Entry[]) => entries.filter((entry) => entry.type === "expense");

export interface PlStatement {
    revenue: number;
    cogs: number;
    grossProfit: number;
    grossMargin: number;
    opex: number;
    operatingProfit: number;
    netProfit: number;
    netMargin: number;
}

export function computePl(entries: Entry[]): PlStatement {
    const revenue = sum(income(entries).map((entry) => entry.amount));
    const cogs = sum(expense(entries).filter((entry) => entry.category === "Bahan Baku").map((entry) => entry.amount));
    const grossProfit = revenue - cogs;
    const opex = sum(expense(entries).filter((entry) => entry.category !== "Bahan Baku").map((entry) => entry.amount));
    const operatingProfit = grossProfit - opex;
    return {
        revenue,
        cogs,
        grossProfit,
        grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
        opex,
        operatingProfit,
        netProfit: operatingProfit,
        netMargin: revenue > 0 ? (operatingProfit / revenue) * 100 : 0,
    };
}

export interface CashFlow {
    inflow: number;
    outflow: number;
    net: number;
    balance: number;
}

export function computeCash(allEntries: Entry[], periodEntries: Entry[]): CashFlow {
    const inflow = sum(income(periodEntries).map((entry) => entry.amount));
    const outflow = sum(expense(periodEntries).map((entry) => entry.amount));
    const net = inflow - outflow;
    const lifetimeNet =
        sum(income(allEntries).map((entry) => entry.amount)) - sum(expense(allEntries).map((entry) => entry.amount));
    return { inflow, outflow, net, balance: OPENING_CASH + lifetimeNet };
}

export function computeCogs(orders: Order[], menus: MenuItem[], ingredients: Ingredient[]): number {
    let total = 0;
    for (const order of orders) {
        for (const item of order.items) {
            const menu = menus.find((candidate) => candidate.id === item.menuId);
            if (menu) total += menuCost(menu, ingredients) * item.qty;
        }
    }
    return total;
}

export function computeWaste(ingredients: Ingredient[]): number {
    let total = 0;
    for (const ingredient of ingredients) {
        for (const batch of ingredient.batches ?? []) {
            if (batch.expiryDays <= 0) total += batch.qty * ingredient.price;
        }
    }
    return total;
}

export function computeInventoryValue(ingredients: Ingredient[]): number {
    return sum(ingredients.map((ingredient) => totalStock(ingredient) * ingredient.price));
}

export function computeInventoryQuantity(ingredients: Ingredient[]): number {
    return sum(ingredients.map((ingredient) => totalStock(ingredient)));
}

export interface InventoryAccounting {
    beginning: number;
    purchases: number;
    cogs: number;
    ending: number;
    adjustment: number;
    waste: number;
    transfer: number;
    opname: number;
    value: number;
    quantity: number;
    itemCount: number;
    batchCount: number;
    averageUnitCost: number;
}

export function computeInventoryAccounting(params: {
    ingredients: Ingredient[];
    orders: Order[];
    menus: MenuItem[];
    periodEntries: Entry[];
}): InventoryAccounting {
    const { ingredients, orders, menus, periodEntries } = params;
    const purchases = sum(
        expense(periodEntries).filter((entry) => entry.category === "Bahan Baku").map((entry) => entry.amount)
    );
    const cogs = computeCogs(orders, menus, ingredients);
    const value = computeInventoryValue(ingredients);
    const quantity = computeInventoryQuantity(ingredients);
    const waste = computeWaste(ingredients);
    return {
        beginning: value - purchases + cogs,
        purchases,
        cogs,
        ending: value,
        adjustment: 0,
        waste,
        transfer: 0,
        opname: value,
        value,
        quantity,
        itemCount: ingredients.length,
        batchCount: ingredients.reduce((count, ingredient) => count + (ingredient.batches?.length ?? 0), 0),
        averageUnitCost: quantity > 0 ? value / quantity : 0,
    };
}

export interface BalanceSheet {
    cash: number;
    receivable: number;
    inventory: number;
    totalAsset: number;
    payable: number;
    liability: number;
    equity: number;
}

export function computeBalanceSheet(cash: number, inventory: number, period: PlStatement): BalanceSheet {
    const receivable = period.revenue * 0.08;
    const payable = period.cogs * 0.12;
    const totalAsset = cash + receivable + inventory;
    return {
        cash,
        receivable,
        inventory,
        totalAsset,
        payable,
        liability: payable,
        equity: totalAsset - payable,
    };
}

export interface UnitEconomics {
    sellingPrice: number;
    variableCost: number;
    fixedCost: number;
    contributionMargin: number;
    contributionMarginPct: number;
    breakEvenUnits: number;
    breakEvenRupiah: number;
    averageOrderValue: number;
    costPerOrder: number;
    profitPerUnit: number;
    orderCount: number;
    unitsSold: number;
}

const fixedCategories = ["Gaji", "Sewa", "Listrik & Air"];

export function computeUnitEconomics(params: {
    orders: Order[];
    menus: MenuItem[];
    ingredients: Ingredient[];
    periodEntries: Entry[];
}): UnitEconomics {
    const { orders, menus, ingredients, periodEntries } = params;
    const revenue = sum(orders.map((order) => order.total));
    const unitsSold = sum(orders.map((order) => order.items.reduce((total, item) => total + item.qty, 0)));
    const variableTotal = computeCogs(orders, menus, ingredients);
    const fixedCost = sum(
        expense(periodEntries)
            .filter((entry) => fixedCategories.includes(entry.category))
            .map((entry) => entry.amount)
    );

    const sellingPrice = unitsSold > 0 ? revenue / unitsSold : 0;
    const variableCost = unitsSold > 0 ? variableTotal / unitsSold : 0;
    const contributionMargin = sellingPrice - variableCost;
    const contributionMarginPct = sellingPrice > 0 ? (contributionMargin / sellingPrice) * 100 : 0;
    const orderCount = orders.length;

    return {
        sellingPrice,
        variableCost,
        fixedCost,
        contributionMargin,
        contributionMarginPct,
        breakEvenUnits: contributionMargin > 0 ? fixedCost / contributionMargin : 0,
        breakEvenRupiah: contributionMarginPct > 0 ? fixedCost / (contributionMarginPct / 100) : 0,
        averageOrderValue: orderCount > 0 ? revenue / orderCount : 0,
        costPerOrder: orderCount > 0 ? variableTotal / orderCount : 0,
        profitPerUnit: contributionMargin,
        orderCount,
        unitsSold,
    };
}

export function ingredientUnitCost(ingredient: Ingredient): number {
    return unitBase(ingredient.unit).factor > 0 ? ingredient.price / unitBase(ingredient.unit).factor : ingredient.price;
}
