import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { initSocket } from "../services/socket"; // your socket client
import { addNotification, fetchNotifications, markAllNotificationsRead, markAsRead } from "../featurres/notifications/notificationSlice";
import { Heart, MessageCircle, UserPlus, AtSign, Bell, BellRing, Check } from "lucide-react";
// import { useNavigate } from "react-router-dom";
import { initSocket } from "../socket";

const Notifications = ({ userId }) => { 
  const dispatch = useDispatch();
  // const navigate = useNavigate();

  const { items: notifications, loading, hasUnread } = useSelector((state) => state.notifications);

  const getIcon = (type) => {
    switch (type) {
      case "like": return <Heart className="w-5 h-5 text-red-500 drop-shadow-sm" />;
      case "comment": return <MessageCircle className="w-5 h-5 text-blue-500 drop-shadow-sm" />;
      case "follow": return <UserPlus className="w-5 h-5 text-green-500 drop-shadow-sm" />;
      case "mention": return <AtSign className="w-5 h-5 text-purple-500 drop-shadow-sm" />;
      default: return <Heart className="w-5 h-5 text-gray-500 drop-shadow-sm" />;
    }
  };

  const getText = (notif) => {
    switch (notif.type) {
      case "like": return "liked your post";
      case "comment": return "commented on your post";
      case "follow": return "started following you";
      case "mention": return "mentioned you";
      default: return "interacted with your content";
    }
  };

  // ----------------- useEffect -----------------
  useEffect(() => {
    // 1️⃣ Fetch initial notifications from backend
    dispatch(fetchNotifications());

    // 2️⃣ Initialize socket connection
    const socket = initSocket(userId);

    // 3️⃣ Listen for real-time notifications
    socket.on("getNotification", (notification) => {
      dispatch(addNotification(notification));
    });

    // 4️⃣ Cleanup on unmount
    return () => {
      socket.off("getNotification");
    };
  }, [dispatch, userId]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin mx-auto" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-pink-300/20 to-red-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/40 animate-slideInDown">
          <div className="flex items-center gap-4">
            <div className="relative">
              {hasUnread ? (
                <BellRing className="w-8 h-8 text-purple-600 animate-pulse" />
              ) : (
                <Bell className="w-8 h-8 text-gray-600" />
              )}
              {hasUnread && (
                <>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75"></span>
                </>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-gray-600 text-sm mt-1">Stay updated with your latest activity</p>
            </div>
          </div>
          
          {hasUnread && (
            <button 
              onClick={handleMarkAllRead} 
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-medium group"
            >
              <Check className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              Mark All Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-2xl">
                <Bell className="w-16 h-16 text-gray-400" />
              </div>
              {/* Floating decorative elements */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full animate-float"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">All caught up!</h3>
            <p className="text-gray-500 text-lg">No new notifications to show</p>
            <div className="mt-6 flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 animate-fadeInUp">
            {notifications.map((notif, index) => (
              <div
                key={notif._id}
                style={{ animationDelay: `${index * 0.05}s` }}
                className={`group flex items-center p-6 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl rounded-3xl border backdrop-blur-xl animate-slideInLeft ${
                  !notif.isRead 
                    ? "bg-gradient-to-r from-purple-50/90 via-pink-50/90 to-indigo-50/90 border-purple-200/50 shadow-lg" 
                    : "bg-white/70 border-white/40 hover:bg-white/90 shadow-md"
                }`}
                onClick={() => {
                  handleMarkAsRead(notif._id);
                  // Navigation functionality would work with actual router
                  // if (notif.type === "follow") navigate(`/profile/${notif.sender._id}`);
                  // else navigate(`/post/${notif.postId}`);
                }}
              >
                {/* Profile Image with Enhanced Styling */}
                <div className="relative mr-5">
                  <img
                    src={notif.sender?.profilePicture || "/placeholder.svg"}
                    alt={notif.sender?.userName || "User"}
                    className="w-14 h-14 rounded-full object-cover ring-3 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Notification type indicator */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-lg border-2 border-white flex items-center justify-center">
                    {getIcon(notif.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 transition-colors duration-300 group-hover:text-purple-700">
                      {notif.sender?.userName || "Unknown"}
                    </span>
                    <span className="text-gray-600 font-medium">
                      {getText(notif)}
                    </span>
                    {!notif.isRead && (
                      <div className="relative ml-2">
                        <span className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full inline-block animate-pulse"></span>
                        <span className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping opacity-75"></span>
                      </div>
                    )}
                  </div>
                  
                  {notif.content && (
                    <p className="text-gray-700 text-sm line-clamp-2 mb-2 font-medium bg-white/50 rounded-lg px-3 py-1.5 border border-white/60">
                      {notif.content}
                    </p>
                  )}
                  
                  <span className="text-gray-500 text-xs font-medium bg-gray-100/70 rounded-full px-3 py-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Action indicator */}
                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slideInDown {
          animation: slideInDown 0.6s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Notifications;