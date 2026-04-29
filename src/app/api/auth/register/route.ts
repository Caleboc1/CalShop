import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: "All fields required" }, { status: 400 });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const hashed = await bcrypt.hash(password, 12);
    const referralCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const user = await prisma.user.create({
      data: { name, email, password: hashed, referralCode },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
