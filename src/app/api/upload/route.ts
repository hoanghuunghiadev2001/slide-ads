/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Đảm bảo runtime là nodejs để sử dụng Buffer và Stream
export const runtime = "nodejs";

// Cấu hình Cloudinary (Dùng biến SERVER SIDE)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    console.log(cloudinary);
    console.log(process.env.CLOUDINARY_UPLOAD_PRESET);
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Chuyển file sang Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Xử lý Upload Stream
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "slides",
          // Thêm upload_preset nếu bạn muốn dùng các cấu hình đã cài sẵn trên Cloudinary
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      secure_url: result.secure_url,
    });
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}
