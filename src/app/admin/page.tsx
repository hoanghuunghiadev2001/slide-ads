/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";

export default function AdminPage() {
  const [slides, setSlides] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<number>(8);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State dành riêng cho việc Edit
  const [editingId, setEditingId] = useState<number | null>(null);

  const cloud_name = "dcmypc7xh";
  const UPLOAD_PRESET = "slide-ads";

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  async function fetchSlides() {
    try {
      setFetching(true);
      const res = await fetch("/api/slides");
      const data = await res.json();
      setSlides(data);
    } catch (err) {
      console.error("Lỗi fetch:", err);
    } finally {
      setFetching(false);
    }
  }

  // Bật chế độ chỉnh sửa: Đưa dữ liệu cũ lên Form
  const startEdit = (slide: any) => {
    setEditingId(slide.id);
    setTitle(slide.title);
    setDuration(slide.duration || 8);
    setPreviewUrl(slide.imageUrl); // Hiển thị ảnh cũ để xem trước
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hủy chỉnh sửa
  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDuration(8);
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    console.log("tét");
  };

  async function handleUpload() {
    // Basic validation: Title is always required.
    // File is only required if we aren't editing.
    if (!title || (!file && !editingId)) {
      return alert("Vui lòng nhập tiêu đề và chọn ảnh");
    }

    setLoading(true);
    try {
      let finalImageUrl = previewUrl; // Default to current preview (existing URL)

      // 1. Only upload to Cloudinary if a NEW file was selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          { method: "POST", body: formData },
        );

        const uploadData = await cloudRes.json();
        if (!uploadData.secure_url) throw new Error("Upload ảnh thất bại");
        finalImageUrl = uploadData.secure_url;
      }

      // 2. Determine if we are Updating (PUT) or Creating (POST)
      const method = editingId ? "PUT" : "POST";
      const bodyData = {
        title,
        duration,
        imageUrl: finalImageUrl,
        ...(editingId && { id: editingId }), // Include ID if editing
      };

      const saveRes = await fetch("/api/slides", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!saveRes.ok) throw new Error("Lỗi lưu dữ liệu vào hệ thống");

      // 3. Reset Form & Refresh
      alert(editingId ? "Cập nhật thành công!" : "Thêm mới thành công!");
      cancelEdit(); // Helper to clear all states
      await fetchSlides();
    } catch (err: any) {
      alert(err.message || "Lỗi xử lý");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSlide(id: number) {
    if (!confirm("Xác nhận xóa slide này?")) return;
    await fetch(`/api/slides?id=${id}`, { method: "DELETE" });
    fetchSlides();
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
              Admin <span className="text-blue-600">Portal</span>
            </h1>
            <p className="text-slate-500 mt-1">
              Hệ thống điều khiển Toyota Bình Dương
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM SIDE (CREATE / EDIT) */}
          <div className="lg:col-span-1 space-y-6">
            <div
              className={`p-6 rounded-3xl shadow-sm border transition-all duration-500 ${editingId ? "bg-blue-50 border-blue-200 ring-4 ring-blue-500/5" : "bg-white border-slate-200"}`}
            >
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <span
                  className={`w-2 h-6 rounded-full ${editingId ? "bg-orange-500 animate-pulse" : "bg-blue-600"}`}
                ></span>
                {editingId ? "Chỉnh sửa Slide" : "Tạo Slide Mới"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Tiêu đề slide
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Thời lượng (giây)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full mt-1 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Hình ảnh {editingId && "(Để trống nếu giữ nguyên)"}
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-white transition-colors bg-white/50"
                  >
                    <input
                      type="file"
                      hidden
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <p className="text-xs text-slate-500 italic">
                      Thay đổi hình ảnh 4K
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95 ${editingId ? "bg-orange-500 hover:bg-orange-600" : "bg-slate-900 hover:bg-blue-600"}`}
                  >
                    {loading
                      ? "ĐANG LƯU..."
                      : editingId
                        ? "LƯU THAY ĐỔI"
                        : "THÊM SLIDE MỚI"}
                  </button>
                  {editingId && (
                    <button
                      onClick={cancelEdit}
                      className="px-6 py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                    >
                      HỦY
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="bg-slate-900 rounded-3xl p-4 shadow-2xl relative aspect-video overflow-hidden">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    alt=""
                  />
                  <div className="relative z-10 h-full flex flex-col justify-end p-2">
                    <p className="text-blue-400 text-[10px] font-bold tracking-[0.3em] uppercase">
                      Visual Preview
                    </p>
                    <h3 className="text-white font-black text-lg uppercase truncate">
                      {title || "---"}
                    </h3>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                  Chế độ xem trước
                </div>
              )}
            </div>
          </div>

          {/* LIST SIDE */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="font-bold text-slate-700">Slides Displaying</h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black">
                  {slides.length} ITEMS
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Details</th>
                      <th className="px-6 py-4 text-center">Timing</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {slides.map((s) => (
                      <tr
                        key={s.id}
                        className={`group transition-all ${editingId === s.id ? "bg-blue-50/50" : "hover:bg-slate-50"}`}
                      >
                        <td className="px-6 py-4">
                          <div className="w-20 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                            <img
                              src={s.imageUrl}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700 text-sm">
                            {s.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono italic">
                            Cloudinary-ID: {s.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-mono text-blue-600 font-bold">
                          {s.duration}s
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(s)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Sửa slide"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteSlide(s.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
