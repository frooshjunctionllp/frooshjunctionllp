import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { OnlineOrder, OrderStatus } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const customerId = searchParams.get("customerId");
    const pnr = searchParams.get("pnr");
    const status = searchParams.get("status");

    const query: any = {};
    if (phone) {
      query.$or = [{ customerPhone: phone }, { "customer.phone": phone }];
    } else if (customerId) {
      query.customerId = customerId;
    } else if (pnr) {
      query.pnr = pnr;
    }

    if (status) {
      query.orderStatus = status;
    }

    const { db } = await connectToDatabase();
    const orders = await db
      .collection("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const cleaned = orders.map(({ _id, ...rest }) => rest);
    return NextResponse.json({ success: true, data: cleaned });
  } catch (err: any) {
    console.error("Orders GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message, data: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const order: OnlineOrder = await req.json();

    if (!order.id || !order.customerName || !order.items || order.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order ID, customer name, and items are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Ensure orderStatus is new if not specified
    const orderToInsert = {
      ...order,
      orderStatus: order.orderStatus || "new",
      createdAt: order.createdAt || new Date().toISOString(),
    };

    await db.collection("orders").updateOne(
      { id: order.id },
      { $set: orderToInsert },
      { upsert: true }
    );

    // If customer has a phone, update or register in customers collection
    if (order.customerPhone) {
      await db.collection("customers").updateOne(
        { phone: order.customerPhone },
        {
          $set: {
            name: order.customerName,
            phone: order.customerPhone,
            instagramId: (order as any).customerInstagram || "",
            lastActiveAt: new Date().toISOString(),
          },
          $setOnInsert: {
            id: (order as any).customerId || `CUST-${Date.now().toString().slice(-4)}`,
            gender: "other",
            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, order: orderToInsert });
  } catch (err: any) {
    console.error("Orders POST error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, orderStatus, notes, items, total } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    const updateFields: any = {
      updatedAt: new Date().toISOString(),
    };
    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (notes !== undefined) updateFields.notes = notes;
    if (items) updateFields.items = items;
    if (total !== undefined) updateFields.total = total;

    const { db } = await connectToDatabase();
    const result = await db
      .collection("orders")
      .findOneAndUpdate(
        { id },
        { $set: updateFields },
        { returnDocument: "after" }
      );

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const { _id, ...updatedOrder } = result;
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err: any) {
    console.error("Orders PATCH error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
