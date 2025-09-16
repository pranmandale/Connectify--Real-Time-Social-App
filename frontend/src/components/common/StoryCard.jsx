import { useState } from "react"
import { Plus } from "lucide-react"
import CreateStoryModal from "../../modals/CreateStoryModal"
import StoryViewModal from "../../modals/StoryViewModal"

const StoryCard = ({ profileImage, userName, isOwn, stories = [] }) => {
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false)
  const [showViewStoryModal, setShowViewStoryModal] = useState(false)

  const handleClick = () => {
    if (isOwn) {
      if (!stories || stories.length === 0) {
        setShowCreateStoryModal(true)
      } else {
        setShowViewStoryModal(true)
      }
    } else {
      setShowViewStoryModal(true)
    }
  }

  return (
    <>
      <div
        className="flex flex-col items-center space-y-2 min-w-[70px] cursor-pointer"
        onClick={handleClick}
      >
        <div className="relative">
          <div
            className={`w-16 h-16 rounded-full p-0.5 ${
              isOwn
                ? "bg-gray-300"
                : "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"
            }`}
          >
            <img
              src={profileImage || "/placeholder.svg"}
              alt={userName}
              className="w-full h-full rounded-full object-cover bg-white p-0.5"
            />
          </div>
          {isOwn && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
              <Plus size={12} className="text-white" />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-700 text-center max-w-[70px] truncate">
          {isOwn ? "Your Story" : userName}
        </p>
      </div>

      {/* Story Modals */}
      {showCreateStoryModal && (
        <CreateStoryModal
          isOpen={showCreateStoryModal}
          onClose={() => setShowCreateStoryModal(false)}
        />
      )}

      {showViewStoryModal && stories?.length > 0 && (
        <StoryViewModal
          isOpen={showViewStoryModal}
          onClose={() => setShowViewStoryModal(false)}
          stories={stories}
          initialIndex={0}
        />
      )}
    </>
  )
}

export default StoryCard
