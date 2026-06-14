import { useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { uploadImage } from "../api/images"
import type { Image } from "../types/image"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<Image | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const MAX_SIZE = 50 * 1024 * 1024

  const validateFile = (f: File): string | null => {
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (!allowed.includes(f.type)) {
      return "Unsupported type. Use JPEG, PNG, or WEBP."
    }
    if (f.size > MAX_SIZE) {
      return `File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max 50 MB.`
    }
    if (f.size === 0) {
      return "File is empty."
    }
    return null
  }

  const handleFile = useCallback((selected: File | null) => {
    if (!selected) return
    const validationError = validateFile(selected)
    if (validationError) {
      setError(validationError)
      return
    }
    setFile(selected)
    setResult(null)
    setError(null)

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(selected)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFile(e.dataTransfer.files[0])
    },
    [handleFile],
  )

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const uploaded = await uploadImage(file)
      setResult(uploaded)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-surface-100">Upload Image</h1>
        <p className="mt-1 text-sm text-surface-400">
          Upload an image to create watermarked copies for your recipients
        </p>
      </div>

      {result ? (
        <div className="animate-fade-in-up rounded-[16px] border border-accent-image/20 bg-accent-image/[0.03] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-semantic-success/10">
            <svg className="h-6 w-6 text-semantic-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-surface-100">Upload Successful</h2>
          <p className="mt-1 text-sm text-surface-400">{result.original_filename}</p>
          <p className="mt-1 text-sm text-surface-400">
            {(result.file_size / 1024).toFixed(1)} KB &middot;{" "}
            {result.mime_type.split("/")[1].toUpperCase()}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate(`/images/${result.id}/watermark`)}
              className="rounded-[10px] bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-brand-400"
            >
              Generate Watermarks
            </button>
            <button
              onClick={() => navigate("/")}
              className="rounded-[10px] border border-surface-700 px-5 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800"
            >
              Dashboard
            </button>
            <button
              onClick={reset}
              className="rounded-[10px] border border-surface-700 px-5 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800"
            >
              Upload Another
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-[16px] border-2 border-dashed p-12 transition-all duration-150 ${
              dragOver
                ? "scale-[1.01] border-brand-400 bg-brand-400/5"
                : "border-surface-750 bg-surface-850/50 hover:scale-[1.005] hover:border-surface-500"
            }`}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="mb-4 max-h-64 rounded-[12px] object-contain"
              />
            ) : (
              <>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-surface-800">
                  <svg className="h-6 w-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-surface-400">
                  Drag image here or click to browse
                </p>
                <p className="mt-1.5 text-xs text-surface-500">
                  PNG, JPG, WEBP &middot; Max 50 MB
                </p>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />

          {file && !result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[12px] border border-surface-750 bg-surface-850 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-200">{file.name}</p>
                  <p className="mt-0.5 text-xs text-surface-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="shrink-0 rounded-[8px] px-3 py-1.5 text-sm font-medium text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200"
                >
                  Remove
                </button>
              </div>

              {uploading && (
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-700">
                  <div className="h-full w-full animate-shimmer rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500 bg-[length:200%_100%]" />
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="w-full rounded-[12px] bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </div>
          )}

          {error && (
            <div className="animate-fade-in-up rounded-[12px] border border-semantic-error/15 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  )
}
