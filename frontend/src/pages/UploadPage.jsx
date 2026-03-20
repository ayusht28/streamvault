import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Film,
  Image,
  CheckCircle,
  AlertCircle,
  X,
  Tag,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { videoAPI } from "../services/api";

export default function UploadPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("idle"); // idle | uploading | success | error
  const [progress, setProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [videoDragging, setVideoDragging] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tags: "" });
  const [error, setError] = useState("");
  const videoInputRef = useRef();
  const thumbInputRef = useRef();

  const handleVideoDrop = useCallback(
    (e) => {
      e.preventDefault();
      setVideoDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("video/")) {
        setVideoFile(file);
        if (!form.title)
          setForm((p) => ({ ...p, title: file.name.replace(/\.[^/.]+$/, "") }));
      }
    },
    [form.title],
  );

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbFile(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return setError("Please select a video file");
    if (!form.title.trim()) return setError("Please enter a title");

    const formData = new FormData();
    formData.append("video", videoFile);
    if (thumbFile) formData.append("thumbnail", thumbFile);
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    if (form.tags) {
      formData.append(
        "tags",
        form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(","),
      );
    }

    setStep("uploading");
    setError("");

    try {
      const { data } = await videoAPI.upload(formData, (e) => {
        const pct = Math.round((e.loaded / e.total) * 100);
        setProgress(pct);
      });
      if (data.success) {
        setStep("success");
        setTimeout(() => navigate(`/watch/${data.video.id}`), 1800);
      }
    } catch (err) {
      setStep("error");
      setError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
    }
  };

  if (step === "uploading") {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
        >
          <CloudUpload size={28} className="text-white" />
        </motion.div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">
          Uploading your video
        </h2>
        <p className="text-slate-500 mb-8">Please keep this tab open</p>
        <div
          className="w-full rounded-full overflow-hidden h-2 mb-3"
          style={{ background: "var(--bg-elevated)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #8b5cf6, #6366f1, #22d3ee)",
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="font-mono text-sm text-violet-400">{progress}%</p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
        >
          <CheckCircle size={36} className="text-white" />
        </motion.div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">
          Video uploaded!
        </h2>
        <p className="text-slate-500">Redirecting to your video…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl gradient-text mb-1">
          Upload Video
        </h1>
        <p className="text-slate-500 text-sm">
          Share your content with the StreamVault community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setVideoDragging(true);
          }}
          onDragLeave={() => setVideoDragging(false)}
          onDrop={handleVideoDrop}
          onClick={() => !videoFile && videoInputRef.current.click()}
          className="relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300"
          style={{
            border: `2px dashed ${videoDragging ? "#8b5cf6" : videoFile ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
            background: videoDragging
              ? "rgba(139,92,246,0.08)"
              : videoFile
                ? "rgba(139,92,246,0.05)"
                : "var(--bg-card)",
          }}
        >
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) {
                setVideoFile(f);
                if (!form.title)
                  setForm((p) => ({
                    ...p,
                    title: f.name.replace(/\.[^/.]+$/, ""),
                  }));
              }
            }}
          />
          <div className="py-12 flex flex-col items-center text-center px-6">
            <motion.div
              animate={{ y: videoDragging ? -8 : 0 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: videoFile
                  ? "rgba(139,92,246,0.2)"
                  : "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              {videoFile ? (
                <Film size={28} className="text-violet-400" />
              ) : (
                <Upload size={28} className="text-slate-600" />
              )}
            </motion.div>
            {videoFile ? (
              <>
                <p className="font-display font-semibold text-white mb-1">
                  {videoFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoFile(null);
                  }}
                  className="mt-3 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <X size={12} /> Remove
                </button>
              </>
            ) : (
              <>
                <p className="font-display font-semibold text-slate-300 mb-1">
                  Drop your video here
                </p>
                <p className="text-sm text-slate-600">
                  or click to browse · MP4, MKV, MOV, WebM up to 500MB
                </p>
              </>
            )}
          </div>
        </div>

        {/* Details card */}
        <div
          className="rounded-3xl p-6 space-y-5"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Give your video a catchy title"
              className="w-full bg-transparent rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 font-body transition-all"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
              maxLength={255}
            />
            <p className="text-xs text-slate-700 mt-1 text-right">
              {form.title.length}/255
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Tell viewers what your video is about..."
              rows={4}
              className="w-full bg-transparent rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 font-body resize-none transition-all"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag size={11} /> Tags
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              placeholder="gaming, tutorial, vlog  (comma separated)"
              className="w-full bg-transparent rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 font-body transition-all"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Thumbnail
            </label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => thumbInputRef.current.click()}
                className="w-40 rounded-xl overflow-hidden cursor-pointer transition-all hover:opacity-80"
                style={{
                  aspectRatio: "16/9",
                  background: "var(--bg-elevated)",
                  border: "1px dashed var(--border)",
                }}
              >
                {thumbPreview ? (
                  <img
                    src={thumbPreview}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                    <Image size={20} className="mb-1" />
                    <span className="text-xs">Choose image</span>
                  </div>
                )}
              </div>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbChange}
              />
              <div className="text-xs text-slate-600">
                <p>Recommended: 1280×720</p>
                <p>Max size: 5MB</p>
                <p>JPG, PNG, WebP</p>
                {thumbFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setThumbFile(null);
                      setThumbPreview(null);
                    }}
                    className="mt-2 text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <X size={11} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-red-400"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={!videoFile || !form.title.trim() || step === "uploading"}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl text-base font-display font-semibold transition-all flex items-center justify-center gap-3"
          style={{
            background:
              videoFile && form.title.trim()
                ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                : "var(--bg-elevated)",
            color:
              videoFile && form.title.trim() ? "white" : "var(--text-muted)",
            boxShadow:
              videoFile && form.title.trim()
                ? "0 0 24px rgba(139,92,246,0.4)"
                : "none",
          }}
        >
          <Upload size={18} />
          Publish Video
        </motion.button>
      </form>
    </div>
  );
}
