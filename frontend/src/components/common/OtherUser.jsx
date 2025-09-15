
"use client"
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleFollowUser } from "../../featurres/users/userSlice";

const OtherUser = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);

  // derive following from Redux state
  const isFollowing = profile?.following?.some(
    (id) => id.toString() === user._id.toString()
  );

  const handleFollowToggle = () => {
    // Dispatch async toggle; Redux will update the profile.following globally
    dispatch(toggleFollowUser(user._id));
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img
          src={user.profilePicture || "/placeholder.svg"}
          alt={user.userName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p
            className="text-gray-800 text-sm font-medium cursor-pointer"
            onClick={() => navigate(`/profile/${user?.userName}`)}
          >
            {user.userName}
          </p>
          <p className="text-gray-500 text-xs">Suggested for you</p>
        </div>
      </div>
      <button
        onClick={handleFollowToggle}
        className="text-sm font-medium transition-colors cursor-pointer text-purple-600"
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
};

export default OtherUser;
