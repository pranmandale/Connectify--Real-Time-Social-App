import React from "react";

const OtherUser = ({ user }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img
          src={user.profilePicture || "/placeholder.svg"}
          alt={user.userName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-gray-800 text-sm font-medium">{user.userName}</p>
          <p className="text-gray-500 text-xs">Suggested for you</p>
        </div>
      </div>
      <button className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors">
        Follow
      </button>
    </div>
  );
};

export default OtherUser;
