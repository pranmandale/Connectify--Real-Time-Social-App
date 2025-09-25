"use client"

import { useState, useRef } from "react"
import { X, Upload, Type, Loader2, Camera, Video, Edit3 } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { createPortal } from "react-dom"
import { uploadStory } from "../featurres/story/storySlice"
import toast from "react-hot-toast"

const CreateStoryModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const { profile } = useSelector((state) => state.user);
  // console.log(profile)
  const [loading, setLoading] = useState(false)

  const [storyData, setStoryData] = useState({
    mediaType: "image",
    text: "",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    fontSize: "medium",
    textPosition: { x: 50, y: 50 }, // % based positioning
  });
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [addingOverlayText, setAddingOverlayText] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)

  const backgroundColors = [
    "#000000", "#ffffff", "#ff6b6b", "#4ecdc4", "#45b7d1",
    "#96ceb4", "#ffeaa7", "#dda0dd", "#98d8c8", "#f7dc6f"
  ]

  const textColors = ["#ffffff", "#000000", "#ff4757", "#1e90ff", "#2ed573", "#ffa502"]

  const textSizes = [
    { label: "Small", value: "small", className: "text-lg" },
    { label: "Medium", value: "medium", className: "text-2xl" },
    { label: "Large", value: "large", className: "text-4xl" },
  ]

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const mediaType = file.type.startsWith("video/") ? "video" : "image"
    setStoryData((prev) => ({ ...prev, mediaType }))
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setShowTextEditor(false)
    setAddingOverlayText(false)
  }

  const handleTextStory = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    setShowTextEditor(true)
    setAddingOverlayText(false)
    setStoryData((prev) => ({ ...prev, mediaType: "text" }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile && !storyData.text.trim()) {
      alert("Please add content to your story")
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      if (selectedFile) formData.append("storyMedia", selectedFile)
      formData.append("mediaType", storyData.mediaType)
      formData.append("text", storyData.text)
      formData.append("backgroundColor", storyData.backgroundColor)
      formData.append("textColor", storyData.textColor)
      formData.append("fontSize", storyData.fontSize)
      formData.append("textPositionX", storyData.textPosition.x)
      formData.append("textPositionY", storyData.textPosition.y)

      // console.log("Story data:", Object.fromEntries(formData))
      // await new Promise((resolve) => setTimeout(resolve, 1500))


      await toast.promise(
        dispatch(uploadStory(formData)).unwrap(),
        {
          loading: "Uploading story...",
          success: (res) => res?.message || "story created successfully",
          error: (err) => err?.message || err?.error || "Failed to create story",
        }
      )
      handleClose()
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to upload story. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setStoryData({
      mediaType: "image",
      text: "",
      backgroundColor: "#000000",
      textColor: "#ffffff",
      fontSize: "medium",
      textPosition: { x: 50, y: 50 },
    })
    setSelectedFile(null)
    setPreviewUrl("")
    setShowTextEditor(false)
    setAddingOverlayText(false)
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-[95%] max-w-md h-[90%] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Create Story</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-4 overflow-hidden">
          <div className="relative flex-1 flex items-center justify-center aspect-[9/16] bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
            {previewUrl ? (
              <>
                {storyData.mediaType === "video" ? (
                  <video ref={videoRef} src={previewUrl} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={previewUrl} alt="Story preview" className="w-full h-full object-cover" />
                )}

                {/* Overlay Text */}
                {storyData.text && (
                  <div
                    className="absolute cursor-move"
                    style={{
                      top: `${storyData.textPosition.y}%`,
                      left: `${storyData.textPosition.x}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <p
                      className={`text-center font-bold drop-shadow-md ${textSizes.find((s) => s.value === storyData.fontSize)?.className
                        }`}
                      style={{ color: storyData.textColor }}
                    >
                      {storyData.text}
                    </p>
                  </div>
                )}
              </>
            ) : showTextEditor ? (
              <div
                className="w-full h-full flex items-center justify-center p-4"
                style={{ backgroundColor: storyData.backgroundColor }}
              >
                <textarea
                  value={storyData.text}
                  onChange={(e) =>
                    setStoryData((prev) => ({ ...prev, text: e.target.value }))
                  }
                  placeholder="Type your story..."
                  className={`w-full bg-transparent text-center resize-none border-none outline-none font-bold ${textSizes.find((s) => s.value === storyData.fontSize)?.className
                    }`}
                  style={{ color: storyData.textColor }}
                  rows={4}
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <Upload className="w-12 h-12 mb-3 opacity-70" />
                <p className="text-sm">Add photo, video, or text</p>
              </div>
            )}
          </div>

          {/* Text Options when adding overlay */}
          {previewUrl && addingOverlayText && (
            <div className="mt-4 space-y-3">
              <textarea
                value={storyData.text}
                onChange={(e) => setStoryData((prev) => ({ ...prev, text: e.target.value }))}
                placeholder="Add text to your story..."
                className="w-full bg-gray-50 rounded-lg p-2 border border-gray-300 text-center font-bold outline-none"
                style={{ color: storyData.textColor }}
              />

              {/* Font Size */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Font Size</p>
                <div className="flex gap-2">
                  {textSizes.map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => setStoryData((prev) => ({ ...prev, fontSize: size.value }))}
                      className={`px-3 py-1 rounded-lg border text-sm font-medium transition ${storyData.fontSize === size.value
                        ? "bg-purple-500 text-white border-purple-500"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Text Color</p>
                <div className="flex gap-2">
                  {textColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setStoryData((prev) => ({ ...prev, textColor: color }))}
                      className={`w-7 h-7 rounded-full border ${storyData.textColor === color ? "ring-2 ring-purple-500" : "border-gray-300"
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          {!previewUrl && !showTextEditor && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-purple-50 border border-gray-200 transition"
              >
                <Camera className="w-6 h-6 text-purple-500 mb-1" />
                <span className="text-xs font-medium text-gray-700">Photo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current.accept = "video/*"
                  fileInputRef.current?.click()
                }}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-purple-50 border border-gray-200 transition"
              >
                <Video className="w-6 h-6 text-purple-500 mb-1" />
                <span className="text-xs font-medium text-gray-700">Video</span>
              </button>
              <button
                type="button"
                onClick={handleTextStory}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-purple-50 border border-gray-200 transition"
              >
                <Type className="w-6 h-6 text-purple-500 mb-1" />
                <span className="text-xs font-medium text-gray-700">Text</span>
              </button>
            </div>
          )}

          {/* Add Text button when media uploaded */}
          {previewUrl && !addingOverlayText && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setAddingOverlayText(true)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-purple-50 border border-gray-300 flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Add Text</span>
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!selectedFile && !storyData.text.trim())}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                "Share Story"
              )}
            </button>
          </div>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>,
    document.body
  )
}

export default CreateStoryModal
