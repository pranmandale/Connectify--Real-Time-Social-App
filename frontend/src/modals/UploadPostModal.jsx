"use client"

import { useState, useRef } from "react"
import { X, Upload, ImageIcon, Video, Loader2 } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { uploadPost } from "../featurres/post/postSlice.jsx"
import { toast } from "react-hot-toast"

const UploadPostModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch()
    const { loading } = useSelector((state) => state.post)
    const { profile } = useSelector((state) => state.user)

    const [formData, setFormData] = useState({
        title: "",
        caption: "",
    })
    const [selectedFiles, setSelectedFiles] = useState([]) // {file, url, type}
    const fileInputRef = useRef(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files)
        if (!files.length) return

        const newFiles = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            type: file.type.startsWith("video/") ? "video" : "image",
        }))

        setSelectedFiles((prev) => [...prev, ...newFiles])
        e.target.value = "" // reset input so same file can be chosen again
    }

    const removeFile = (index) => {
        URL.revokeObjectURL(selectedFiles[index].url)
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    }

   

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (selectedFiles.length === 0) {
            alert("Please select at least one file")
            return
        }

        const uploadFormData = new FormData()
        uploadFormData.append("title", formData.title)
        uploadFormData.append("caption", formData.caption)

        // detect mediaType (if mixed, fallback to "mixed")
        let mediaType = "image"
        if (selectedFiles.some((f) => f.type === "video")) {
            mediaType = "video"
        }
        if (selectedFiles.some((f) => f.type === "video") && selectedFiles.some((f) => f.type === "image")) {
            mediaType = "mixed"
        }

        uploadFormData.append("mediaType", mediaType)

        // append all files
        selectedFiles.forEach((item) => {
            uploadFormData.append("media", item.file)
        })

        try {
            await toast.promise(
                dispatch(uploadPost(uploadFormData)).unwrap(),
                {
                    loading: "Uploading post...",
                    success: (res) => res?.message || "Post uploaded successfully",
                    error: (err) => err?.message || err?.error || "Failed to upload post",
                }
            )
            handleClose()
        } catch (error) {
            console.error("Upload failed:", error)
        }

    }


    const handleClose = () => {
        // revoke all preview URLs
        selectedFiles.forEach((item) => URL.revokeObjectURL(item.url))

        setFormData({ title: "", caption: "" })
        setSelectedFiles([])
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Create New Post</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* User */}
                        <div className="flex items-center gap-3">
                            <img
                                src={profile?.profilePicture || "/diverse-user-avatars.png"}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                                <p className="font-medium text-gray-800">{profile?.userName}</p>
                                <p className="text-sm text-gray-600">{profile?.name}</p>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Give your post a title..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        {/* Caption */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                            <textarea
                                name="caption"
                                value={formData.caption}
                                onChange={handleInputChange}
                                placeholder="Write a caption..."
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Media Files</label>

                            {selectedFiles.length === 0 ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400"
                                >
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">Click or drag files to upload</p>
                                    <p className="text-sm text-gray-500">Supports multiple files</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedFiles.map((item, index) => (
                                            <div key={index} className="relative group">
                                                {item.type === "video" ? (
                                                    <video src={item.url} className="w-full h-32 object-cover rounded-lg" controls />
                                                ) : (
                                                    <img src={item.url} alt="" className="w-full h-32 object-cover rounded-lg" />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                    >
                                        Add More Files
                                    </button>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        {/* Media Count */}
                        {selectedFiles.length > 0 && (
                            <div className="text-sm text-gray-600">
                                {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || selectedFiles.length === 0}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Share Post"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UploadPostModal
