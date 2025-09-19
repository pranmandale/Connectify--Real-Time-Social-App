import React, { useState, useEffect, useRef } from "react";
import { Search, Send, Phone, Video, Info, Image } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { initSocket, getSocket } from "../socket";
import {
  addMessage,
  fetchMessages,
  markMessagesAsRead,
  setCurrentRoom,
} from "../featurres/messages/messageSlice";
import { getFollowers, getFollowing } from "../featurres/follows/followSlice";

const Messages = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const { followersList, followingList } = useSelector((state) => state.follow);
  const { messages } = useSelector((state) => state.messages);

  console.log(messages)

  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
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
      const sender =
        typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id;

      // Only add if it's the current room and not from self
      if (msg.roomId === selectedUser?._id && sender !== loggedInUserId) {
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

  // Send message function
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

    // Optimistic UI update for sender
    dispatch(addMessage({ ...newMessage, type: "sent" }));
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Selecting a chat user
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    const roomId = [loggedInUserId, user._id].sort().join("_");
    dispatch(setCurrentRoom(roomId));
    dispatch(fetchMessages(roomId));
    dispatch(markMessagesAsRead({ roomId}));

    const socket = getSocket();
    socket?.emit("joinRoom", user._id);
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Sidebar */}
      <div className="w-96 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col shadow-xl">
        <div className="p-6 border-b border-gray-200/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Messages
          </h1>
        </div>
        <div className="p-4 border-b border-gray-200/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white transition-all duration-200 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`cursor-pointer p-4 mx-2 my-1 rounded-xl hover:bg-gray-50/80 transition-all duration-200 transform hover:scale-[1.02] ${selectedUser?._id === user._id
                    ? "bg-gradient-to-r from-purple-100/80 to-pink-100/80 shadow-md"
                    : ""
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm">{user.userName}</h3>
                    <p className="text-sm text-gray-600 truncate mt-1">{user.name}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No conversations</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedUser.profilePicture}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedUser.online ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="w-5 h-5 text-gray-600" />
                <Video className="w-5 h-5 text-gray-600" />
                <Info className="w-5 h-5 text-gray-600" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.senderId._id === loggedInUserId ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${msg.senderId._id === loggedInUserId
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-gray-100/80 text-gray-800"
                      }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p className="text-xs mt-1 text-gray-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-xl flex items-center space-x-3">
              <button className="p-2 rounded-full hover:bg-gray-100/80 transition-colors duration-200">
                <Image className="w-5 h-5 text-gray-600" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white transition-all duration-200 text-sm"
              />
              <button
                onClick={sendMessage}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Welcome to Connectify
            </h2>
            <p className="text-gray-600 text-lg mb-2">Start meaningful conversations</p>
            <p className="text-gray-400">Select a chat from the sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
