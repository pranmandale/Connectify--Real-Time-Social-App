import React from "react";
import dp from "../../assets/s1.png"

const StoryCard = ({ profileImage, userName, isOwn }) => {
  return (
    <div className="flex flex-col items-center space-y-1 min-w-[70px] relative">
      {/* Story Circle */}
      <div
        className={`w-16 h-16 rounded-full p-1 ${
          isOwn
            ? "bg-gray-300 flex items-center justify-center"
            : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
        }`}
      >
        <img
          src={profileImage || "/placeholder.svg"}
          alt={userName}
          className={`w-full h-full rounded-full border-2 border-white object-cover ${
            isOwn ? "p-0.5" : ""
          }`}
        />
      </div>

      {/* Add + button if it's your own story */}
      {isOwn && (
        <div className="absolute bottom-4 right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white text-white text-xs font-bold">
          +
        </div>
      )}

      {/* Story Name */}
      <span className="text-gray-700 text-xs text-center max-w-[70px] truncate">
        {isOwn ? "Your Story" : userName}
      </span>
    </div>
  );
};

export default StoryCard;
