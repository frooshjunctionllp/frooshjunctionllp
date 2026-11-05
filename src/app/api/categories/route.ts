import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { INITIAL_CATEGORIES } from "@/lib/seedData";
import { Category } from "@/types";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const categories = await db.collection("categories").find({}).toArray();

    if (categories.length === 0) {
      await db.collection("categories").insertMany(INITIAL_CATEGORIES as any);
      return NextResponse.json({ success: true, data: INITIAL_CATEGORIES });
    }

    const cleaned = categories.map(({ _id, ...rest }) => rest);
    return NextResponse.json({ success: true, data: cleaned });
  } catch (err: any) {
    console.error("Categories GET error:", err);
    return NextResponse.json({
      success: true,
      data: INITIAL_CATEGORIES,
      fallback: true,
    });
  }
}

export async function POST(req: Request) {
  try {
    const category: Category = await req.json();
    if (!category.id || !category.name) {
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
    await db.collection("categories").deleteOne({ id });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
