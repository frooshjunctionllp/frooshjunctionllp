import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/types";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const categories = await db.collection("categories").find({}).toArray();

    const cleaned = categories.map(({ _id, ...rest }) => rest);
    return NextResponse.json({ success: true, data: cleaned });
  } catch (err: unknown) {
    console.error("Categories GET error:", err);
    return NextResponse.json({ success: false, message: "Database unavailable. Please try again." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const category: Category = await req.json();
    if (!category || typeof category.id !== "string" || !category.id.trim() || typeof category.name !== "string" || !category.name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category ID and name are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    await db
      .collection("categories")
      .updateOne({ id: category.id }, { $set: category }, { upsert: true });

    return NextResponse.json({ success: true, category });
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
    if (await db.collection("products").findOne({ categoryId: id })) {
      return NextResponse.json({ success: false, message: "Move or delete this category's products before deleting the category." }, { status: 409 });
    }
    await db.collection("categories").deleteOne({ id });

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Database request failed" },
      { status: 500 }
    );
  }
}
