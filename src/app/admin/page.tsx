/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [slides, setSlides] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  async function fetchSlides() {
    const res = await fetch("/api/slides");
    setSlides(await res.json());
  }

  async function handleUpload() {
    if (!file || !title) return alert("Chọn ảnh và nhập tiêu đề");

    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    const uploadData = await uploadRes.json();

    await fetch("/api/slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, imageUrl: uploadData.secure_url }),
    });

    setTitle("");
    setFile(null);
    fetchSlides();
  }

  async function deleteSlide(id: number) {
    await fetch(`/api/slides?id=${id}`, { method: "DELETE" });
    fetchSlides();
  }

  useEffect(() => {
    fetchSlides();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Quản lý Slide</h1>
      <div className="mb-4 flex items-center gap-2">
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        <input
          type="text"
          placeholder="Tiêu đề"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </div>

      <ul>
        {slides.map(s => (
          <li key={s.id} className="mb-2 flex items-center gap-2">
            <img src={s.imageUrl} alt={s.title} className="w-32 h-20 object-cover" />
            <span>{s.title}</span>
            <button
              onClick={() => deleteSlide(s.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
