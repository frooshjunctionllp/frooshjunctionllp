import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DEFAULT_ADMIN, BACKUP_ADMIN, INITIAL_WORKERS } from "@/lib/seedData";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, pin } = body;

    if (!username || !pin) {
      return NextResponse.json(
        { success: false, message: "Username and PIN/password are required" },
        { status: 400 }
      );
    }

    const trimmedUser = String(username).trim();
    const escapedUser = trimmedUser.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const trimmedPin = String(pin).trim();

    try {
      const { db } = await connectToDatabase();
      const user = await db.collection("workers").findOne({
        $or: [
          { username: { $regex: new RegExp(`^${escapedUser}$`, "i") } },
          { id: { $regex: new RegExp(`^${escapedUser}$`, "i") } },
        ],
      });

      if (user) {
        if (!user.isActive) {
          return NextResponse.json(
            { success: false, message: "Account is disabled. Contact Admin." },
            { status: 403 }
          );
        }
        if (user.pin !== trimmedPin) {
          return NextResponse.json(
            { success: false, message: "Incorrect PIN or Password" },
            { status: 401 }
          );
        }

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
          },
        });
      }
    } catch (dbErr) {
      console.warn("DB lookup error, falling back to seed auth:", dbErr);
    }

    // Fallback in-memory check (e.g. if DB not connected yet or offline)
    const allUsers = [DEFAULT_ADMIN, BACKUP_ADMIN, ...INITIAL_WORKERS];
    const fallbackUser = allUsers.find(
      (u) =>
        (u.username.toLowerCase() === trimmedUser.toLowerCase() ||
          u.id.toLowerCase() === trimmedUser.toLowerCase()) &&
        u.pin === trimmedPin
    );

    if (fallbackUser) {
      return NextResponse.json({
        success: true,
        user: {
          id: fallbackUser.id,
          username: fallbackUser.username,
          name: fallbackUser.name,
          role: fallbackUser.role,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid ID/Username or PIN" },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Login failed" },
      { status: 500 }
    );
  }
}
