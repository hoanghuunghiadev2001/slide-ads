import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 401 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 401 });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

  const response = NextResponse.json({ message: "Login thành công" });
response.cookies.set({
  name: "token",
  value: token,
  httpOnly: true,
  path: "/",
  maxAge: 60*60,
  sameSite: "lax",
});


  return response;
}
