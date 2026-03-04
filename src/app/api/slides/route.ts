import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🧭 Lấy danh sách slide
export async function GET() {
  const slides = await prisma.slide.findMany({
    orderBy: { position: "asc" },
  });
  return NextResponse.json(slides);
}

// ✨ Tạo mới slide
export async function POST(req: Request) {
  try {
    const { title, imageUrl, duration } = await req.json();

    const maxPositionResult = await prisma.slide.aggregate({
      _max: { position: true },
    });
    const maxPosition = maxPositionResult._max.position || 0;

    const slide = await prisma.slide.create({
      data: {
        title,
        imageUrl,
        duration: duration ? Number(duration) : 8, // Ưu tiên 8s nếu không nhập
        position: maxPosition + 1,
      },
    });

    return NextResponse.json(slide);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi khi tạo slide" }, { status: 500 });
  }
}

// 🛠️ CẬP NHẬT SLIDE (Tính năng mới)
export async function PUT(req: Request) {
  try {
    const { id, title, imageUrl, duration } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID slide" }, { status: 400 });
    }

    const updatedSlide = await prisma.slide.update({
      where: { id: Number(id) },
      data: {
        title,
        imageUrl,
        duration: duration ? Number(duration) : undefined,
      },
    });

    return NextResponse.json(updatedSlide);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Không tìm thấy slide hoặc lỗi cập nhật" },
      { status: 404 },
    );
  }
}

// 🗑️ Xóa slide
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await prisma.slide.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Slide not found or already deleted" },
      { status: 404 },
    );
  }
}
