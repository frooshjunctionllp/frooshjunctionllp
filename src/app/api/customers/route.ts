import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { INITIAL_CUSTOMERS } from "@/lib/seedData";
import { Customer } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const id = searchParams.get("id");

    const { db } = await connectToDatabase();

    if (phone) {
      const cleanPhone = phone.trim().replace(/[\s-]/g, "");
      const customer = await db.collection("customers").findOne({
        $or: [
          { phone: cleanPhone },
          { phone: phone.trim() },
          { phone: { $regex: cleanPhone } },
        ],
      });
      if (customer) {
        const { _id, ...rest } = customer;
        return NextResponse.json({ success: true, customer: rest });
      }
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    if (id) {
      const customer = await db.collection("customers").findOne({ id });
      if (customer) {
        const { _id, ...rest } = customer;
        return NextResponse.json({ success: true, customer: rest });
      }
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    const customers = await db
      .collection("customers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    if (customers.length === 0) {
      return NextResponse.json({ success: true, data: [] });
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
