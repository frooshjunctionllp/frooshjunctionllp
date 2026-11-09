import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/types";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const products = await db
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const cleaned = products.map(({ _id, ...rest }) => rest);
    return NextResponse.json({ success: true, data: cleaned });
  } catch (err: unknown) {
    console.error("Products GET error:", err);
    return NextResponse.json({ success: false, message: "Database unavailable. Please try again." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const product: Product = await req.json();
    if (!product || typeof product.id !== "string" || !product.id.trim() || typeof product.name !== "string" || !product.name.trim()) {
      return NextResponse.json(
        { success: false, message: "Product ID and name are required" },
        { status: 400 }
      );
    }

    if (!product.categoryId || !Array.isArray(product.variants) || product.variants.length === 0 ||
      product.variants.some((variant) => !variant || typeof variant.name !== "string" || !variant.name.trim() || !Number.isFinite(variant.price) || variant.price < 0)) {
      return NextResponse.json({ success: false, message: "Choose a category and provide a valid name and non-negative price for every size." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    if (!await db.collection("categories").findOne({ id: product.categoryId })) {
      return NextResponse.json({ success: false, message: "This category no longer exists. Please choose another category." }, { status: 400 });
    }
    await db
      .collection("products")
      .updateOne({ id: product.id }, { $set: product }, { upsert: true });

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Database request failed" },
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
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Database request failed" },
      { status: 500 }
    );
  }
}
