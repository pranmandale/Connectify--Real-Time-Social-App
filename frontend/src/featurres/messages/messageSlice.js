import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosNodeClient } from "../../services/axiosInstance";
// import { socket } from "../../socket"; // your singleton socket instance

// ------------------ INITIAL STATE ------------------
const initialState = {
  messages: [],       // all messages for current room
  currentRoomId: null,
  loading: false,
};

// ------------------ ASYNC THUNKS ------------------

// 1️⃣ Fetch message history for a room
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axiosNodeClient.get(`/message/getMessages/${roomId}`);
      return response.data.messages;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 2️⃣ Send a message via REST fallback
export const sendMessageAPI = createAsyncThunk(
  "messages/sendMessageAPI",
  async ({ roomId, senderId, message }, { rejectWithValue }) => {
    try {
      const response = await axiosNodeClient.post(`/message/sendMessage`, { roomId, senderId, message });
      console.log(response.data)
      return response.data.newMessage;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 3️⃣ Mark all messages in a room as read
export const markMessagesAsRead = createAsyncThunk(
  "messages/markMessagesAsRead",
  async ({ roomId }, { rejectWithValue }) => {
    try {
      const response = await axiosNodeClient.put(`/message/markRead`, { roomId });
      return response.data.result; // backend returns DB update result
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ------------------ MESSAGE SLICE ------------------
const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    // Set the current room when user switches chats
    setCurrentRoom: (state, action) => {
      state.currentRoomId = action.payload;
      state.messages = [];
    },

    // Add a single message (from Socket.IO or local send)
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    // Clear messages (e.g., when logging out)
    clearMessages: (state) => {
      state.messages = [];
      state.currentRoomId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => { state.loading = true; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state) => { state.loading = false; })

      // Send Message via REST fallback
      .addCase(sendMessageAPI.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })

      // Mark Messages as Read
      .addCase(markMessagesAsRead.fulfilled, (state) => {
        state.messages = state.messages.map(msg => ({ ...msg, isRead: true }));
      });
  },
});

// ------------------ EXPORTS ------------------
export const { setCurrentRoom, addMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;