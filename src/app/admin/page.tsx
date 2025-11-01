/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [slides, setSlides] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const cloud_name = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME =
    "dcmypc7xh");
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  // 🧭 Lấy danh sách slide
  async function fetchSlides() {
    try {
      setFetching(true);
      const res = await fetch("/api/slides");
      if (!res.ok) throw new Error("Không thể tải danh sách");
      const data = await res.json();
      setSlides(data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách slide");
    } finally {
      setFetching(false);
    }
  }

  // ☁️ Upload trực tiếp lên Cloudinary
  async function handleUpload() {
    if (!file || !title) return alert("Vui lòng chọn ảnh và nhập tiêu đề");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET); // ⚠️ thay bằng preset của bạn

      // 👉 Upload trực tiếp lên Cloudinary
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await cloudRes.json();
      if (!uploadData.secure_url)
        throw new Error(uploadData.error?.message || "Upload thất bại");

      // 👉 Gửi URL + title vào DB
      const saveRes = await fetch("/api/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          imageUrl: uploadData.secure_url,
        }),
      });

      if (!saveRes.ok) throw new Error("Không thể lưu slide vào hệ thống");

      setTitle("");
      setFile(null);
      await fetchSlides();
    } catch (err: any) {
      alert(err.message || "Lỗi upload");
    } finally {
      setLoading(false);
    }
  }

  // 🗑 Xóa slide
  async function deleteSlide(id: number) {
    if (!confirm("Bạn có chắc muốn xóa slide này?")) return;
    try {
      await fetch(`/api/slides?id=${id}`, { method: "DELETE" });
      fetchSlides();
    } catch {
      alert("Không thể xóa slide");
    }
  }

  // 🪄 Lần đầu load trang
  useEffect(() => {
    fetchSlides();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Quản lý Slide</h1>

      {/* Khu vực upload */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <input
          type="text"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`px-4 py-2 rounded text-white flex items-center justify-center gap-2 ${
            loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading && (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          )}
          {loading ? "Đang upload..." : "Upload"}
        </button>
      </div>

      {/* Danh sách slide */}
      {fetching ? (
        <p>Đang tải danh sách slide...</p>
      ) : slides.length === 0 ? (
        <p>Chưa có slide nào.</p>
      ) : (
        <ul>
          {slides.map((s) => (
            <li
              key={s.id}
              className="mb-2 flex items-center gap-3 border-b pb-2 w-fit"
            >
              <img
                src={s.imageUrl}
                alt={s.title}
                className="w-32 h-20 object-cover rounded"
              />
              <span className="flex-1">{s.title}</span>
              <button
                onClick={() => deleteSlide(s.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
