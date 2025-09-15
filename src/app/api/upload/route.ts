import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
console.log(
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY?.slice(0,4),
  process.env.CLOUDINARY_API_SECRET?.slice(0,4)
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
    console.log(
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY?.slice(0,4),
  process.env.CLOUDINARY_API_SECRET?.slice(0,4)
);

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "slides" }, (error, result) => {
      if (error) reject(error);
      else resolve(NextResponse.json({ secure_url: result?.secure_url }));
    });
    stream.end(buffer);
  });
}