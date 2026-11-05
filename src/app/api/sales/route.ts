import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getInitialSales } from "@/lib/seedData";
import { Sale } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    // Worker role is restricted from viewing overall sales ledger & reports
    if (role === "worker") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Workers cannot access sales records" },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const sales = await db
      .collection("sales")
      .find({})
      .sort({ date: -1 })
      .toArray();

    if (sales.length === 0) {
      const initial = getInitialSales();
      await db.collection("sales").insertMany(initial as any);
      return NextResponse.json({ success: true, data: initial });
    }

    const cleaned = sales.map(({ _id, ...rest }) => rest);
    return NextResponse.json({ success: true, data: cleaned });
  } catch (err: any) {
    console.error("Sales GET error:", err);
    return NextResponse.json({
      success: true,
      data: getInitialSales(),
      fallback: true,
    });
  }
}

export async function POST(req: Request) {
  try {
    const sale: Sale = await req.json();
    if (!sale.id || !sale.items || sale.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid sale data" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    await db
      .collection("sales")
      .updateOne({ id: sale.id }, { $set: sale }, { upsert: true });

    return NextResponse.json({ success: true, sale });
  } catch (err: any) {
    console.error("Sales POST error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Sale ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    await db.collection("sales").deleteOne({ id });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
