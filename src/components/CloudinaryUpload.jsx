"use client";

import { useState } from "react";

export default function CloudinaryUpload({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);

  const CLOUD_NAME = "df19ltqsg";
  const UPLOAD_PRESET = "robotics_club_uploads";

  // 🔥 MAIN HANDLER
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ SIZE LIMIT (20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("File too large (max 20MB)");
      return;
    }

    const type = file.type.startsWith("video") ? "video" : "image";

    // 🔥 VIDEO DURATION CHECK
    if (type === "video") {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);

        if (video.duration > 30) {
          alert("Video must be under 30 seconds");
          return;
        }

        uploadFile(file, type);
      };

      video.src = URL.createObjectURL(file);
    } else {
      uploadFile(file, type);
    }
  };

  // 🔥 UPLOAD FUNCTION
  const uploadFile = async (file, type) => {
    setMediaType(type);

    const previewURL = URL.createObjectURL(file);
    setPreview(previewURL);

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("resource_type", "auto");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!data.secure_url) throw new Error("Upload failed");

      // 🔥 REPLACE PREVIEW (ONLY ONE)
      setPreview(data.secure_url);

      onUpload({
        url: data.secure_url,
        public_id: data.public_id,
        mediaType: data.resource_type,
      });

    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="w-full rounded border p-2"
      />

      {/* SINGLE PREVIEW */}
      {preview && (
        <div>
          {mediaType === "image" ? (
            <img src={preview} className="h-40 w-40 rounded object-cover" />
          ) : (
            <video src={preview} controls className="h-40 w-40 rounded object-cover" />
          )}
        </div>
      )}

      {loading && <p className="text-blue-500 text-sm">Uploading...</p>}
    </div>
  );
}