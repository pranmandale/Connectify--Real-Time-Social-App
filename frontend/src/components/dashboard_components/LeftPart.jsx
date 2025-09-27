
import {
  User,
  LogOut,
  Home,
  Search,
  PlusSquare,
  Film,
  Heart,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../featurres/users/authSlice";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";

// 👇 import your socket and notification slice
import { initSocket } from "../../socket";
import { addNotification } from "../../featurres/notifications/notificationSlice";
import { useLocation, useNavigate } from "react-router-dom";

const LeftPart = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("/dashboard");

  const { profile } = useSelector((state) => state.user);
  const { hasUnread } = useSelector((state) => state.notifications);
  const { unreadUsers } = useSelector((state) => state.msgNotifications);

  // console.log(unreadUsers);

  const handleLogout = async () => {
    try {
      await toast.promise(dispatch(logout()).unwrap(), {
        loading: "Logging out...",
        success: (res) => res?.message || "Logout successful",
        error: (err) => err?.message || "Error during logout",
      });
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const handleNavigation = (path) => {
    setActiveItem(path);
    navigate(path);
  };

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const isActive = (path) => activeItem === path;

  // 👇 socket integration for real-time notifications
  useEffect(() => {
    if (!profile?._id) return;

    const socket = initSocket(profile._id);

    socket.on("getNotification", (notification) => {
      dispatch(addNotification(notification));
    });

    return () => {
      socket.off("getNotification");
    };
  }, [dispatch, profile?._id]);

  const navigationItems = [
    { path: "/dashboard", icon: Home, label: "Home", color: "from-blue-500 to-purple-600" },
    { path: "/search", icon: Search, label: "Search", color: "from-emerald-500 to-teal-600" },
    { path: "/create", icon: PlusSquare, label: "Create", color: "from-pink-500 to-rose-600" },
    { path: "/reels", icon: Film, label: "Reels", color: "from-orange-500 to-red-600" },
    { path: "/messages", icon: MessageCircle, label: "Messages", color: "from-indigo-500 to-blue-600" },
    { path: "/notifications", icon: Heart, label: "Notifications", color: "from-purple-500 to-pink-600" },
    { path: `/profile/${profile?.userName}`, icon: User, label: "Profile", color: "from-violet-500 to-purple-600" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-[20%] hidden lg:flex flex-col h-screen bg-gradient-to-br from-white/95 via-purple-50/30 to-pink-50/30 backdrop-blur-2xl border-r border-white/40 shadow-2xl overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-10 w-40 h-40 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-40 -left-10 w-32 h-32 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-0 w-24 h-24 bg-gradient-to-r from-pink-400/10 to-red-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="flex-1 p-6 relative z-10 overflow-y-auto scrollbar-hide">
          {/* Enhanced Brand */}
          <div className="mb-10 animate-slideInDown">
            <div className="relative">
              <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent relative">
                Connectify
              </h1>
              <div className="absolute -top-1 -left-1">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse opacity-80" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 font-medium">Connect. Share. Inspire.</p>
          </div>

          {/* Enhanced Navigation */}
          <nav className="space-y-2 mb-10">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActiveItem = isActive(item.path) || (item.path.includes("/profile/") && activeItem.includes("/profile/"));

              return (
                <div
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  className={`group flex items-center space-x-4 cursor-pointer transition-all duration-300 p-4 rounded-2xl transform hover:scale-105 animate-slideInLeft relative overflow-hidden ${isActiveItem
                    ? `bg-gradient-to-r ${item.color} text-white shadow-2xl`
                    : "text-gray-600 hover:text-purple-600 hover:bg-white/60 backdrop-blur-sm border border-transparent hover:border-white/40 hover:shadow-lg"
                    }`}
                >
                  {/* Active background effect */}
                  {isActiveItem && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
                  )}

                  <div className="relative z-10 flex items-center space-x-4 w-full">
                    <div className="relative">
                      <Icon size={24} className={`transition-all duration-300 ${isActiveItem ? 'drop-shadow-sm' : 'group-hover:scale-110'}`} />

                      {/* Notifications Badge */}
                      {item.label === "Notifications" && hasUnread && (
                        <>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-75"></span>
                        </>
                      )}

                      {/* Messages Badge - Enhanced with count */}
                      {item.label === "Messages" && unreadUsers.length > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs text-white font-bold border-2 border-white animate-pulse shadow-lg">
                          {unreadUsers.length > 99 ? '99+' : unreadUsers.length}
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-semibold">{item.label}</span>
                  </div>

                  {/* Hover effect indicator */}
                  <div className={`absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color} transform transition-all duration-300 ${isActiveItem ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100'
                    } origin-center rounded-l-full`}></div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Enhanced Logout */}
        <div className="p-6 border-t border-white/30 bg-white/30 backdrop-blur-xl relative z-10 animate-slideInUp">
          <button
            onClick={handleLogout}
            className="group flex items-center space-x-4 text-gray-600 hover:text-red-500 transition-all duration-300 p-4 rounded-2xl hover:bg-red-50/80 backdrop-blur-sm w-full border border-transparent hover:border-red-200/50 hover:shadow-lg transform hover:scale-105"
          >
            <LogOut size={24} className="transition-transform duration-300 group-hover:scale-110" />
            <span className="text-lg font-semibold">Logout</span>

            {/* Logout hover indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-red-600 transform transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-center rounded-l-full"></div>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around p-3 max-w-md mx-auto">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActiveItem = isActive(item.path) || (item.path.includes("/profile/") && activeItem.includes("/profile/"));

            return (
              <div
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all duration-200 relative ${isActiveItem
                  ? 'text-purple-600 transform scale-110'
                  : 'text-gray-600 hover:text-purple-600 active:scale-95'
                  }`}
              >
                <div className="relative">
                  <Icon size={22} className="transition-transform duration-200" />
                  
                  {/* Mobile Notifications Badge */}
                  {item.label === "Notifications" && hasUnread && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}

                  {/* Mobile Messages Badge */}
                  {item.label === "Messages" && unreadUsers.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {unreadUsers.length > 9 ? '9+' : unreadUsers.length}
                    </span>
                  )}
                  
                  {/* Active indicator dot */}
                  {isActiveItem && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></div>
                  )}
                </div>
                <span className="text-xs font-medium mt-1 hidden sm:block">{item.label}</span>
              </div>
            );
          })}

          {/* Profile in mobile bottom nav */}
          <div
            onClick={() => handleNavigation(`/profile/${profile?.userName}`)}
            className={`flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all duration-200 relative ${(isActive(`/profile/${profile?.userName}`) || activeItem.includes("/profile/"))
              ? 'text-purple-600 transform scale-110'
              : 'text-gray-600 hover:text-purple-600 active:scale-95'
              }`}
          >
            <div className="relative">
              <img
                src={profile?.profilePicture || "/placeholder.svg"}
                alt="Profile"
                className="w-6 h-6 rounded-full border-2 border-current"
              />
              {(isActive(`/profile/${profile?.userName}`) || activeItem.includes("/profile/")) && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></div>
              )}
            </div>
            <span className="text-xs font-medium mt-1 hidden sm:block">Profile</span>
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInUp {
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
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default LeftPart;