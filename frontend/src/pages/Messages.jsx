



import React, { useState, useEffect, useRef } from "react";
import { Search, Send, Phone, Video, Info, Image, ArrowLeft, MoreVertical, Smile } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { initSocket, getSocket } from "../socket";
import {
  addMessage,
  fetchMessages,
  markMessagesAsRead,
  setCurrentRoom,
} from "../featurres/messages/messageSlice";
import { getFollowers, getFollowing } from "../featurres/follows/followSlice";
import { setOnlineUsers } from "../featurres/messages/onlineUserSlice.js";
import { markUserReadMsg } from "../featurres/msgNotifications/msgNotiSlice";

const Messages = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const { followersList, followingList } = useSelector((state) => state.follow);
  const { messages } = useSelector((state) => state.messages);
  const { onlineUsers } = useSelector((state) => state.online);

  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  const loggedInUserId = profile?._id;

  // Fetch followers & following on profile load and initialize socket
  useEffect(() => {
    if (!loggedInUserId) return;
    dispatch(getFollowers(loggedInUserId));
    dispatch(getFollowing(loggedInUserId));
    initSocket(loggedInUserId);
  }, [loggedInUserId, dispatch]);

  // Handle incoming messages via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleChatMessage = (msg) => {
      const currentRoomId = [loggedInUserId, selectedUser?._id].sort().join("_");

      const senderId =
        typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id;

      if (msg.roomId === currentRoomId && senderId !== loggedInUserId) {
        dispatch(addMessage(msg));
      }
    };

    socket.on("chatMessage", handleChatMessage);
    return () => socket.off("chatMessage", handleChatMessage);
  }, [dispatch, loggedInUserId, selectedUser]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const roomId = [loggedInUserId, selectedUser._id].sort().join("_");
    const newMessage = {
      senderId: { _id: loggedInUserId },
      roomId,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    const socket = getSocket();
    socket.emit("chatMessage", newMessage);

    dispatch(addMessage(newMessage));
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowSidebar(false); // Hide sidebar on mobile when chat is selected
    const roomId = [loggedInUserId, user._id].sort().join("_");

    dispatch(setCurrentRoom(roomId));
    dispatch(fetchMessages(roomId));
    dispatch(markMessagesAsRead({ roomId }));

    const socket = getSocket();
    socket?.emit("joinRoom", roomId);

    // Clear unread for this user
    dispatch(markUserReadMsg(String(user._id)));
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true);
    setSelectedUser(null);
  };

  // Merge followers + following for sidebar without duplicates
  const chatUsers = [...followersList, ...followingList].filter(
    (v, i, a) => a.findIndex((u) => u._id === v._id) === i
  );

  const filteredUsers = chatUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.userName.toLowerCase().includes(search.toLowerCase())
  );

  // Listen for online users
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOnlineUsers = (online) => {
      dispatch(setOnlineUsers(online.map((id) => String(id))));
    };

    socket.on("getOnlineUsers", handleOnlineUsers);
    return () => socket.off("getOnlineUsers", handleOnlineUsers);
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 relative">
      {/* Mobile Bottom Padding */}
      <div className="w-full pb-16 lg:pb-0">
        
        {/* Sidebar - Responsive */}
        <div className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative top-0 left-0 z-30 lg:z-auto
          w-full sm:w-96 lg:w-96
          h-full lg:h-screen
          bg-white/95 lg:bg-white/80 backdrop-blur-xl 
          border-r border-gray-200/50 
          flex flex-col shadow-xl
          transition-transform duration-300 ease-in-out
        `}>
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Messages
              </h1>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100/80 rounded-full transition-colors lg:hidden">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 sm:p-4 border-b border-gray-200/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50/80 border border-gray-200/50 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.length ? (
              <div className="p-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleSelectUser(user)}
                    className={`cursor-pointer p-3 sm:p-4 mx-1 my-1 rounded-xl hover:bg-gray-50/80 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                      selectedUser?._id === user._id
                        ? "bg-gradient-to-r from-purple-100/80 to-pink-100/80 shadow-md"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3 relative">
                      <div className="relative">
                        <img
                          src={user.profilePicture || "/placeholder.svg"}
                          alt={user.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                        {/* Online dot */}
                        {onlineUsers.includes(String(user._id)) && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                          {user.userName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
                          {user.name}
                        </p>
                        {onlineUsers.includes(String(user._id)) && (
                          <span className="text-xs text-green-600 font-medium">Active now</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {/* You can add last message time here */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-medium">No conversations found</p>
                <p className="text-sm text-gray-400 mt-1">Try searching for someone</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`
          ${showSidebar ? 'hidden lg:flex' : 'flex'}
          flex-1 flex-col bg-white/50 backdrop-blur-sm
          fixed lg:relative top-0 right-0 
          w-full lg:w-auto
          h-full lg:h-screen
          z-20 lg:z-auto
        `}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200/50 bg-white/90 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={handleBackToSidebar}
                    className="p-2 hover:bg-gray-100/80 rounded-full transition-colors lg:hidden"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="relative">
                    <img
                      src={selectedUser.profilePicture}
                      alt={selectedUser.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                    {onlineUsers.includes(String(selectedUser._id)) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {selectedUser.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {onlineUsers.includes(String(selectedUser._id))
                        ? "Active now"
                        : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 cursor-pointer hover:text-purple-500 transition-colors" />
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 cursor-pointer hover:text-purple-500 transition-colors" />
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 cursor-pointer hover:text-purple-500 transition-colors" />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-4">
                {messages.map((msg, i) => {
                  const senderId =
                    typeof msg.senderId === "string"
                      ? msg.senderId
                      : msg.senderId._id;

                  const isMe = senderId === loggedInUserId;

                  return (
                    <div
                      key={i}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 py-2 sm:px-4 sm:py-2 rounded-2xl shadow-sm ${
                          isMe
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
                            : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <p className={`text-xs mt-1 text-right ${
                          isMe ? 'text-purple-100' : 'text-gray-500'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 sm:p-4 border-t border-gray-200/50 bg-white/90 backdrop-blur-xl">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button className="p-2 rounded-full hover:bg-gray-100/80 transition-colors duration-200">
                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                  <div className="flex-1 flex items-center bg-gray-50/80 border border-gray-200/50 rounded-full overflow-hidden">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-transparent focus:outline-none text-sm"
                    />
                    <button className="p-2 hover:bg-gray-100/80 rounded-full transition-colors">
                      <Smile className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <button
                    onClick={sendMessage}
                    className="p-2 sm:p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    <Send className="w-4 h-4 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
              <div className="max-w-md">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Send className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  Welcome to Connectify
                </h2>
                <p className="text-gray-600 text-base sm:text-lg mb-2">
                  Start meaningful conversations
                </p>
                <p className="text-gray-400 text-sm sm:text-base">Select a chat from the sidebar</p>
              </div>
            </div>
          )}
        </div>

        {/* Overlay for mobile when chat is open */}
        {!showSidebar && (
          <div 
            className="fixed inset-0 bg-black/20 z-10 lg:hidden"
            onClick={handleBackToSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default Messages;