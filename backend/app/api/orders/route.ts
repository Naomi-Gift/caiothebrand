import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface OrderLineInput {
  itemId?: string;
  name: string;
  descriptor?: string;
  size: { label: string };
  addOns: { label: string; price: number }[];
  quantity: number;
  unitPrice: number;
}

interface CreateOrderBody {
  branchId: string;
  fulfillment: "DELIVERY" | "PICKUP";
  lines: OrderLineInput[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string | null;
  paystackRef: string;
  deliveryAddress?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  userId?: string | null;
}

export async function POST(req: NextRequest) {
  let body: CreateOrderBody;
  try {
    body = (await req.json()) as CreateOrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    branchId,
    fulfillment,
    lines,
    subtotal,
    discount,
    total,
    promoCode,
    paystackRef,
    deliveryAddress,
    customerEmail,
    customerName,
    userId,
  } = body;

  if (!branchId || !fulfillment || !lines?.length || !paystackRef) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    const order = await prisma.order.create({
      data: {
        branchId,
        fulfillment,
        subtotal,
        discount: discount ?? 0,
        total,
        promoCode:       promoCode       ?? null,
        paystackRef:     paystackRef,
        deliveryAddress: deliveryAddress ?? null,
        customerEmail:   customerEmail   ?? null,
        customerName:    customerName    ?? null,
        userId:          userId          ?? null,
        lines: {
          create: lines.map((l) => ({
            name:       l.name,
            descriptor: l.descriptor ?? null,
            sizeLabel:  l.size.label,
            addOns:     l.addOns,
            quantity:   l.quantity,
            unitPrice:  l.unitPrice,
            menuItem:   l.itemId
              ? { connect: { id: l.itemId } }
              : undefined,
          })),
        },
      },
      include: { lines: true },
    });

    return NextResponse.json({ id: order.id, createdAt: order.createdAt });
  } catch (err) {
    console.error("[api/orders] create error", err);
    return NextResponse.json(
      { error: "Could not save order." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email is required." }, { status: 400 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { customerEmail: email },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error("[api/orders] fetch error", err);
    return NextResponse.json({ error: "Could not fetch orders." }, { status: 500 });
  }
}
