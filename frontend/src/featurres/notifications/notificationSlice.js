import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosNodeClient } from "../../services/axiosInstance.js"



export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, thunkAPI) => {
    try {
      const res = await axiosNodeClient.get("/notifications/getNoti");
      return res.data.notifications || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Mark all notifications as read
export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, thunkAPI) => {
    try {
      await axiosNodeClient.put("/notifications/read");
      return true;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ------------------ Slice ------------------
const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],          // Array of notifications
    loading: false,     // Loading state
    error: null,        // Error messages
    hasUnread: false,   // True if any notification is unread
  },
  reducers: {
    // Add a new notification (from socket.io)
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.hasUnread = true;
    },
    // Mark a single notification as read
    markAsRead: (state, action) => {
      const id = action.payload;
      const notif = state.items.find((n) => n._id === id);
      if (notif) notif.isRead = true;
      state.hasUnread = state.items.some((n) => !n.isRead);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.hasUnread = action.payload.some((n) => !n.isRead);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // markAllNotificationsRead
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
        state.hasUnread = false;
      });
  },
});

// Export actions and reducer
export const { addNotification, markAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
