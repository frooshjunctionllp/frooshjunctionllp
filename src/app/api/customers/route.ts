import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { INITIAL_CUSTOMERS } from "@/lib/seedData";
import { Customer } from "@/types";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const customers = await db
      .collection("customers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    if (customers.length === 0) {
      await db.collection("customers").insertMany(INITIAL_CUSTOMERS as any);
      return NextResponse.json({ success: true, data: INITIAL_CUSTOMERS });
    }

    const cleaned = customers.map(({ _id, ...rest }) => rest);
    return NextResponse.json({ success: true, data: cleaned });
  } catch (err: any) {
    console.error("Customers GET error:", err);
    return NextResponse.json({
      success: true,
      data: INITIAL_CUSTOMERS,
      fallback: true,
    });
  }
}

export async function POST(req: Request) {
  try {
    const customer: Customer = await req.json();
    if (!customer.id || !customer.name) {
      return NextResponse.json(
        { success: false, message: "Customer ID and name are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    await db
      .collection("customers")
      .updateOne({ id: customer.id }, { $set: customer }, { upsert: true });

    return NextResponse.json({ success: true, customer });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
