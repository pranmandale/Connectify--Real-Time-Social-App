"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, ChevronRight, Heart, Send, MoreHorizontal, Pause, Play } from "lucide-react"
import { useSelector } from "react-redux"
import { createPortal } from "react-dom"


const StoryViewModal = ({ isOpen, onClose, stories = [], initialIndex = 0 }) => {
  const { profile } = useSelector((state) => state.user)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [message, setMessage] = useState("")
  const [showControls, setShowControls] = useState(true)
  const progressRef = useRef(null)
  const timeoutRef = useRef(null)

  const currentStory = stories[currentIndex]
  const STORY_DURATION = 5000 

  // Auto-progress story
  useEffect(() => {
    if (!isOpen || isPaused || !currentStory) return

    const startTime = Date.now()
    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        handleNext()
      } else {
        progressRef.current = requestAnimationFrame(updateProgress)
      }
    }

    progressRef.current = requestAnimationFrame(updateProgress)

    return () => {
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current)
      }
    }
  }, [currentIndex, isPaused, isOpen])

  // Hide controls after 3 seconds
  useEffect(() => {
    if (!showControls) return

    timeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [showControls])

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setProgress(0)
    }
  }

  const handleStoryClick = (side) => {
    if (side === "left") {
      handlePrevious()
    } else {
      handleNext()
    }
  }

  const handlePauseToggle = () => {
    setIsPaused(!isPaused)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    // TODO: Implement send message to story owner
    console.log("Sending message:", message, "to story:", currentStory?.id)
    setMessage("")
  }

  const handleMouseMove = () => {
    setShowControls(true)
  }

  if (!isOpen || !currentStory) return null

  return createPortal (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
    <div className="relative w-full h-full max-w-md mx-auto bg-black" onMouseMove={handleMouseMove}>
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: index < currentIndex ? "100%" : index === currentIndex ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div
          className={`absolute top-12 left-4 right-4 z-20 flex items-center justify-between transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex items-center gap-3">
            <img
              src={currentStory.user?.profilePicture || "/diverse-user-avatars.png"}
              alt={currentStory.user?.userName}
              className="w-8 h-8 rounded-full object-cover border-2 border-white"
            />
            <div>
              <p className="text-white font-medium text-sm">{currentStory.user?.userName}</p>
              <p className="text-white/70 text-xs">{currentStory.timeAgo || "2h"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePauseToggle}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div className="relative w-full h-full flex items-center justify-center">
          {currentStory.mediaType === "video" ? (
            <video
              src={currentStory.mediaUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              onEnded={handleNext}
            />
          ) : (
            <img
              src={currentStory.mediaUrl || "/placeholder.svg?height=800&width=400"}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}

          {/* Story text overlay */}
          {currentStory.text && (
            <div className="absolute inset-x-4 bottom-32 text-center">
              <p className="text-white text-lg font-medium drop-shadow-lg">{currentStory.text}</p>
            </div>
          )}

          {/* Click areas for navigation */}
          <button
            onClick={() => handleStoryClick("left")}
            className="absolute left-0 top-0 w-1/3 h-full z-10 focus:outline-none"
            aria-label="Previous story"
          />
          <button
            onClick={() => handleStoryClick("right")}
            className="absolute right-0 top-0 w-1/3 h-full z-10 focus:outline-none"
            aria-label="Next story"
          />
        </div>

        {/* Navigation arrows */}
        <div
          className={`absolute inset-y-0 left-4 flex items-center transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        >
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
        </div>
        <div
          className={`absolute inset-y-0 right-4 flex items-center transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        >
          {currentIndex < stories.length - 1 && (
            <button onClick={handleNext} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom interaction area */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        >
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send message..."
              className="flex-1 bg-white/20 text-white placeholder-white/70 px-4 py-2 rounded-full border border-white/30 focus:outline-none focus:border-white/50"
            />
            <button type="button" className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!message.trim()}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default StoryViewModal
