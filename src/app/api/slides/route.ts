import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const slides = await prisma.slide.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json(slides);
}

export async function POST(req: Request) {
  const { title, imageUrl } = await req.json();
  const maxPosition = (await prisma.slide.aggregate({ _max: { position: true } }))._max.position || 0;

  const slide = await prisma.slide.create({
    data: { title, imageUrl, position: maxPosition + 1 },
  });

  return NextResponse.json(slide);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.slide.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
