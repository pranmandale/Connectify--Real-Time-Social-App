import {
  User,
  LogOut,
  Home,
  Search,
  PlusSquare,
  Film,
  Heart,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../featurres/users/authSlice";
import { toast } from "react-hot-toast";
import OtherUser from "../common/OtherUser";

const LeftPart = () => {
  const dispatch = useDispatch();
  const { suggestedUsers } = useSelector((state) => state.user);

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

  return (
    <div className="w-[20%] hidden lg:block h-screen bg-white/80 backdrop-blur-sm border-r border-gray-100 p-6 overflow-y-auto scrollbar-hide">
      {/* Brand */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Connectify
        </h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-4">
        <NavItem icon={<Home size={24} />} label="Home" active />
        <NavItem icon={<Search size={24} />} label="Search" />
        <NavItem icon={<PlusSquare size={24} />} label="Create" />
        <NavItem icon={<Film size={24} />} label="Reels" />
        <NavItem icon={<Heart size={24} />} label="Notifications" />
        <NavItem icon={<User size={24} />} label="Profile" />
      </nav>

      {/* Suggested Users */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-gray-600 font-medium">Suggested for you</h4>
          <button className="text-sm text-gray-800 hover:text-purple-600 transition-colors">
            See All
          </button>
        </div>

        <div className="space-y-3">
          {suggestedUsers?.length > 0 ? (
            suggestedUsers.slice(0, 3).map((user) => <OtherUser key={user._id} user={user} />)
          ) : (
            <p className="text-gray-500 text-sm">No suggestions available</p>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 text-gray-600 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 w-full"
        >
          <LogOut size={24} />
          <span className="text-lg">Logout</span>
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active }) => (
  <div
    className={`flex items-center space-x-3 cursor-pointer transition-colors p-2 rounded-lg ${active
        ? "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
      }`}
  >
    {icon}
    <span className="text-lg">{label}</span>
  </div>
);

export default LeftPart;
