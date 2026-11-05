import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DEFAULT_ADMIN, INITIAL_WORKERS } from "@/lib/seedData";
import { WorkerUser } from "@/types";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const workers = await db
      .collection("workers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    if (workers.length === 0) {
      const initial = [DEFAULT_ADMIN, ...INITIAL_WORKERS];
      await db.collection("workers").insertMany(initial as any);
      return NextResponse.json({ success: true, data: initial });
    }

    // Clean _id field from MongoDB
    const cleaned = workers.map(({ _id, ...rest }) => rest);
    return NextResponse.json({ success: true, data: cleaned });
  } catch (err: any) {
    console.error("Workers GET error:", err);
    return NextResponse.json({
      success: true,
      data: [DEFAULT_ADMIN, ...INITIAL_WORKERS],
      fallback: true,
    });
  }
}

export async function POST(req: Request) {
  try {
    const worker: WorkerUser = await req.json();

    if (!worker.id || !worker.name || !worker.username || !worker.pin) {
      return NextResponse.json(
        { success: false, message: "ID, Name, Username and PIN are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    await db.collection("workers").updateOne(
      { id: worker.id },
      { $set: worker },
      { upsert: true }
    );

    return NextResponse.json({ success: true, worker });
  } catch (err: any) {
    console.error("Workers POST error:", err);
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
        { success: false, message: "Worker ID is required" },
        { status: 400 }
      );
    }

    if (id === "ADM-001" || id === "admin") {
      return NextResponse.json(
        { success: false, message: "Cannot delete the primary Store Admin account" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    await db.collection("workers").deleteOne({ id });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("Workers DELETE error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
