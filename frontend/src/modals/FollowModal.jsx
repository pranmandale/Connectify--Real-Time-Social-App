import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toggleFollowUser } from "../featurres/users/userSlice.jsx";
import { getFollowers, getFollowing } from "../featurres/follows/followSlice.jsx";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import profileImage from "../assets/profileImage.jpg"

const FollowModal = ({ isOpen, onClose, userId, type = "followers" }) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { profile } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { followersList, followingList } = useSelector((state) => state.follow);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      if (type === "followers") dispatch(getFollowers(userId));
      else dispatch(getFollowing(userId));
    }
  }, [isOpen, type, userId, dispatch]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setTimeout(() => {
        setUsers(type === "followers" ? followersList : followingList);
        setLoading(false);
      }, 500);
    }
  }, [isOpen, followersList, followingList, type]);

  const filteredUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFollowToggle = (targetUserId) => {
    if (!profile) return alert("Please log in to follow users");
    dispatch(toggleFollowUser(targetUserId));
  };

  // const isFollowing = (targetUserId) => profile?.following?.includes(targetUserId) || false;
  const isFollowing = (targetUserId) => {
    return profile?.following?.some(user => user._id === targetUserId) || false;
  };
  


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {type === "followers" ? "Followers" : "Following"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading {type}...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <Virtuoso
              style={{ height: 400 }}
              totalCount={filteredUsers.length}
              itemContent={(index) => {
                const user = filteredUsers[index];
                return (
                  <div key={user._id} className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePicture || profileImage}
                        alt={user.name}
                        loading="lazy"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p
                          className="font-medium text-gray-800 cursor-pointer"
                          onClick={() => {
                            navigate(`/profile/${user.userName}`);
                            onClose();
                          }}
                        >
                          {user.userName}
                        </p>
                        <p
                          className="text-sm text-gray-600 cursor-pointer"
                          onClick={() => {
                            navigate(`/profile/${user.userName}`);
                            onClose();
                          }}
                        >
                          {user.name}
                        </p>
                      </div>
                    </div>
                    {profile && user._id !== profile._id && (
                      <button
                        onClick={() => handleFollowToggle(user._id)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isFollowing(user._id)
                            ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            : "bg-purple-500 text-white hover:bg-purple-600"
                        }`}
                      >
                        {isFollowing(user._id) ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                );
              }}
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">{searchTerm ? `No ${type} found` : `No ${type} yet`}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowModal;
