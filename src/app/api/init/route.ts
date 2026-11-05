import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import {
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_WORKERS,
  DEFAULT_ADMIN,
  BACKUP_ADMIN,
  getInitialSales,
} from "@/lib/seedData";
import { INITIAL_OFFERS } from "@/services/storageService";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const catCount = await db.collection("categories").countDocuments();
    const prodCount = await db.collection("products").countDocuments();
    const custCount = await db.collection("customers").countDocuments();
    const salesCount = await db.collection("sales").countDocuments();
    const workerCount = await db.collection("workers").countDocuments();
    const offersCount = await db.collection("offers").countDocuments();

    if (catCount === 0 && INITIAL_CATEGORIES.length > 0) {
      await db.collection("categories").insertMany(INITIAL_CATEGORIES as any);
    }
    if (prodCount === 0 && INITIAL_PRODUCTS.length > 0) {
      await db.collection("products").insertMany(INITIAL_PRODUCTS as any);
    }
    if (custCount === 0 && INITIAL_CUSTOMERS.length > 0) {
      await db.collection("customers").insertMany(INITIAL_CUSTOMERS as any);
    }
    if (salesCount === 0 && getInitialSales().length > 0) {
      const sales = getInitialSales();
      await db.collection("sales").insertMany(sales as any);
    }
    if (workerCount === 0) {
      await db
        .collection("workers")
        .insertMany([DEFAULT_ADMIN, BACKUP_ADMIN, ...INITIAL_WORKERS] as any);
    }
    if (offersCount === 0 && INITIAL_OFFERS.length > 0) {
      await db.collection("offers").insertMany(INITIAL_OFFERS as any);
    }

    return NextResponse.json({
      success: true,
      initialized: true,
      counts: {
        categories: Math.max(catCount, INITIAL_CATEGORIES.length),
        products: Math.max(prodCount, INITIAL_PRODUCTS.length),
        customers: Math.max(custCount, INITIAL_CUSTOMERS.length),
        sales: Math.max(salesCount, getInitialSales().length),
        workers: Math.max(workerCount, 2 + INITIAL_WORKERS.length),
        offers: Math.max(offersCount, INITIAL_OFFERS.length),
      },
    });
  } catch (error: any) {
    console.error("MongoDB init error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
