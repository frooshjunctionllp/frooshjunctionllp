import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { INITIAL_PRODUCTS } from "@/lib/seedData";
import { Product } from "@/types";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const products = await db
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    if (products.length === 0) {
      await db.collection("products").insertMany(INITIAL_PRODUCTS as any);
      return NextResponse.json({ success: true, data: INITIAL_PRODUCTS });
    }

    const cleaned = products.map(({ _id, ...rest }) => rest);
    return NextResponse.json({ success: true, data: cleaned });
  } catch (err: any) {
    console.error("Products GET error:", err);
    return NextResponse.json({
      success: true,
      data: INITIAL_PRODUCTS,
      fallback: true,
    });
  }
}

export async function POST(req: Request) {
  try {
    const product: Product = await req.json();
    if (!product.id || !product.name) {
      return NextResponse.json(
        { success: false, message: "Product ID and name are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    await db
      .collection("products")
      .updateOne({ id: product.id }, { $set: product }, { upsert: true });

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
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
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    await db.collection("products").deleteOne({ id });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
