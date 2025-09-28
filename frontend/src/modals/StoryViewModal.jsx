"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { X, Heart, Send, MoreHorizontal, Pause, Play } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { createPortal } from "react-dom"
import { toast } from "react-hot-toast"
import { getStoryById, markStoryViewed } from "../featurres/story/storySlice"
import { fetchStoryLikes, toggleLikeStory } from "../featurres/like/likeSlice"
import StoryLikesModal from "./StoryLikesModal"
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);


const StoryViewModal = ({ isOpen, onClose, stories = [], initialIndex = 0 }) => {
  const { profile } = useSelector((state) => state.user)
  const { story: fetchedStory, loading, error } = useSelector((state) => state.story)
  const { storyLikeCount, storyLikedByUser, storyLikedUsers } = useSelector((state) => state.like)

  const dispatch = useDispatch()

  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [message, setMessage] = useState("")
  const [showControls, setShowControls] = useState(true)
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)
  const [doubleTapTimeout, setDoubleTapTimeout] = useState(null)

  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false)


  const progressRef = useRef(null)
  const timeoutRef = useRef(null)
  const viewedRef = useRef({})

  const STORY_DURATION = 10000

  const currentStory = stories[currentIndex]

  const activeStory = useMemo(() => {
    if (!currentStory) return null
    return currentStory.author?._id === profile?._id && fetchedStory ? fetchedStory : currentStory
  }, [currentStory, fetchedStory, profile?._id])

  // 🔹 Fetch story + likes when switching
  useEffect(() => {
    if (!isOpen || !currentStory || !profile?._id) return

    const storyId = currentStory._id || currentStory.id
    if (!storyId) return

    const fetchStory = async () => {
      try {
        if (currentStory.author?._id === profile?._id) {
          await dispatch(getStoryById(storyId)).unwrap()
        } else {
          if (!viewedRef.current[storyId]) {
            viewedRef.current[storyId] = true
            await dispatch(markStoryViewed(storyId)).unwrap()
          }
        }

        await dispatch(fetchStoryLikes({ storyId, currentUserId: profile._id }))
      } catch (err) {
        console.error("❌ Error fetching story:", err)
      }
    }

    fetchStory()
  }, [isOpen, currentIndex, currentStory, dispatch, profile?._id])

  // 🔹 Auto-progress
  useEffect(() => {
    if (!isOpen || isPaused || !activeStory || showLikeAnimation) return

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
      if (progressRef.current) cancelAnimationFrame(progressRef.current)
    }
  }, [currentIndex, isPaused, isOpen, activeStory, showLikeAnimation])

  // 🔹 Hide controls after 3s
  useEffect(() => {
    if (!showControls) return
    timeoutRef.current = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(timeoutRef.current)
  }, [showControls])

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setProgress(0)
    }
  }

  // 🔹 Double tap to like
  const handleStoryClick = (side, event) => {
    const now = Date.now()

    if (doubleTapTimeout && now - doubleTapTimeout < 300) {
      handleLikeStory(event)
      setDoubleTapTimeout(null)
    } else {
      setDoubleTapTimeout(now)
      setTimeout(() => {
        if (doubleTapTimeout === now) {
          side === "left" ? handlePrevious() : handleNext()
          setDoubleTapTimeout(null)
        }
      }, 300)
    }
  }

  // 🔹 Toggle like using Redux only
  const handleLikeStory = async (event) => {
    if (!profile?._id || !activeStory) return

    const storyId = activeStory._id || activeStory.id

    if (event) {
      setShowLikeAnimation(true)
      setIsPaused(true)
      const rect = event?.currentTarget?.getBoundingClientRect()
      if (rect) {
        createFloatingHeart(event.clientX - rect.left, event.clientY - rect.top)
      }
    }

    try {
      await dispatch(toggleLikeStory(storyId)).unwrap()
      toast.success(storyLikedByUser ? "Story unliked!" : "Story liked!")
    } catch (err) {
      toast.error("Failed to toggle like")
      console.error("❌ Like toggle error:", err)
    }

    if (event) {
      setTimeout(() => {
        setShowLikeAnimation(false)
        setIsPaused(false)
      }, 1000)
  }
}

  const createFloatingHeart = (x, y) => {
    const heart = document.createElement("div")
    heart.innerHTML = "❤️"
    heart.style.position = "absolute"
    heart.style.left = x + "px"
    heart.style.top = y + "px"
    heart.style.fontSize = "2rem"
    heart.style.zIndex = "100"
    heart.style.pointerEvents = "none"
    heart.style.animation = "floatUp 1s ease-out forwards"

    if (!document.querySelector("#story-heart-animation")) {
      const style = document.createElement("style")
      style.id = "story-heart-animation"
      style.textContent = `
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }

    const container = document.querySelector(".story-container")
    if (container) {
      container.appendChild(heart)
      setTimeout(() => heart.remove(), 1000)
    }
  }

  const handlePauseToggle = () => setIsPaused((prev) => !prev)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    toast.success("Message sent!")
    setMessage("")
  }

  const handleMouseMove = () => setShowControls(true);


   const handleOpenLikesModal = () => {
    setIsLikesModalOpen(true)
  }

  const handleCloseLikesModal = () => {
    setIsLikesModalOpen(false)
  }
 


  if (!isOpen || !activeStory) return null

  return createPortal(
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div
        className="story-container relative w-full h-full max-w-md mx-auto bg-black"
        onMouseMove={handleMouseMove}
      >
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width:
                    index < currentIndex
                      ? "100%"
                      : index === currentIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div
          className={`absolute top-12 left-4 right-4 z-20 flex items-center justify-between transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="flex items-center gap-3">
            <img
              src={activeStory.author?.profilePicture || "/diverse-user-avatars.png"}
              alt={activeStory.author?.userName}
              loading="lazy"
              className="w-8 h-8 rounded-full object-cover border-2 border-white"
            />
            <div>
              <p className="text-white font-medium text-sm">{activeStory.author?.userName}</p>
              <p className="text-white/70 text-xs">{dayjs(activeStory.createdAt).fromNow()}</p>
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
          {activeStory.mediaType === "video" ? (
            <video
              src={activeStory.mediaUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              onEnded={handleNext}
            />
          ) : (
            <img
              src={activeStory.mediaUrl || "/placeholder.svg?height=800&width=400"}
              alt="Story"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          )}

          {activeStory.text && (
            <div className="absolute inset-x-4 bottom-32 text-center">
              <p className="text-white text-lg font-medium drop-shadow-lg">{activeStory.text}</p>
            </div>
          )}

          {showLikeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <div className="animate-ping">
                <Heart className="w-20 h-20 text-red-500 fill-current" />
              </div>
            </div>
          )}

          <button
            onClick={(e) => handleStoryClick("left", e)}
            className="absolute left-0 top-0 w-1/3 h-full z-10"
          />
          <button
            onClick={(e) => handleStoryClick("right", e)}
            className="absolute right-0 top-0 w-1/3 h-full z-10"
          />
        </div>

        {/* Bottom Interaction */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
            }`}
        >
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send message..."
              className="flex-1 bg-white/20 text-white placeholder-white/70 px-4 py-2 rounded-full border border-white/30 focus:outline-none focus:border-white/50"
            />
            <button
              type="button"
              onClick={() => handleLikeStory()}
              className={`p-2 rounded-full transition-colors ${storyLikedByUser ? "text-red-500 bg-white/20" : "text-white hover:bg-white/20"
                }`}
            >
              <Heart className={`w-5 h-5 ${storyLikedByUser ? "fill-current" : ""}`} />
            </button>
            <button
              type="submit"
              disabled={!message.trim()}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {storyLikeCount > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-white text-xs">
                {storyLikeCount} {storyLikeCount === 1 ? "like" : "likes"}
              </span>
            </div>
          )}
        </div>

        {/* Own Story Activity */}
        {activeStory.author?._id === profile?._id && (
          <div className="absolute bottom-20 left-0 right-0 p-4 bg-black/60 text-white max-h-40 overflow-y-auto rounded-t-lg">
            {loading ? (
              <p className="text-xs">Loading activity...</p>
            ) : error ? (
              <p className="text-xs text-red-400">{error}</p>
            ) : fetchedStory ? (
              <>
                <h3 className="font-semibold text-sm mb-2">Activity</h3>
                <div className="flex items-center gap-4 mb-2">
                  <p className="text-xs">❤️ {storyLikeCount || 0} likes</p>
                  <p className="text-xs">💬 {fetchedStory.comments?.length || 0} comments</p>
                </div>

                {storyLikedUsers?.length > 0 && (
                  <div className="mb-2">
                    <p 
                    onClick={() => handleOpenLikesModal()}
                    className="text-xs font-medium mb-1">Liked by:</p>
                    <div className="flex flex-wrap gap-1">
                      {storyLikedUsers.slice(0, 3).map((user) => (
                        <span key={user._id} className="text-xs bg-white/20 px-2 py-1 rounded">
                          {user.userName}
                        </span>
                      ))}
                      {storyLikedUsers.length > 3 && (
                        <span className="text-xs text-gray-300">
                          +{storyLikedUsers.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {fetchedStory.comments?.length > 0 ? (
                    fetchedStory.comments.map((c) => (
                      <p key={c._id} className="text-xs">
                        <span className="font-semibold">{c.author?.userName}</span>: {c.text}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-gray-300">No comments yet</p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
     {isLikesModalOpen && (
        <StoryLikesModal
          isOpen={isLikesModalOpen}
          onClose={handleCloseLikesModal}
          storyId={activeStory._id}
        />
      )}
    </>,
    document.body
  )
}

export default StoryViewModal
