




import { Plus } from "lucide-react"

const StoryCard = ({ profileImage, userName, isOwn }) => {
  return (
    <div className="flex flex-col items-center space-y-2 min-w-[70px]">
      <div className="relative">
        <div
          className={`w-16 h-16 rounded-full p-0.5 ${isOwn ? "bg-gray-300" : "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"}`}
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
      <p className="text-xs text-gray-700 text-center max-w-[70px] truncate">{isOwn ? "Your Story" : userName}</p>
    </div>
  )
}

export default StoryCard
