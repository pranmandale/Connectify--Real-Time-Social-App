import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosNodeClient } from "../../services/axiosInstance.js";

// Initial state
const initialState = {
  likeCount: 0,          // total likes of the post
  likedByUser: false,    // whether current user liked this post
  likedUsers: [],        // list of users who liked the post
  loading: false,
  error: null,
};

// 🔹 Toggle like/unlike a post
export const toggleLikePost = createAsyncThunk(
  "like/toggle",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.post(`/like/post/like/${postId}`);
      return { postId, message: res.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔹 Fetch all users who liked a post
export const fetchPostLikes = createAsyncThunk(
  "like/fetch",
  async ({ postId, currentUserId }, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.get(`/like/post/getUserWhoLiked/${postId}`);
      return { postId, users: res.data.users, totalLikes: res.data.totalLikes, currentUserId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


const likeSlice = createSlice({
  name: "like",
  initialState,
  reducers: {
    // Optional: reset state if switching posts
    resetLikeState: (state) => {
      state.likeCount = 0;
      state.likedByUser = false;
      state.likedUsers = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Toggle Like
      .addCase(toggleLikePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        state.loading = false;
        // Optimistic update: toggle likedByUser
        state.likedByUser = !state.likedByUser;
        state.likeCount = state.likedByUser ? state.likeCount + 1 : state.likeCount - 1;
      })
      .addCase(toggleLikePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to toggle like";
      })

      // Fetch likes
      .addCase(fetchPostLikes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostLikes.fulfilled, (state, action) => {
        state.loading = false;
        state.likedUsers = action.payload.users || [];
        state.likeCount = action.payload.totalLikes || 0;
        // Check if current user is among liked users
        const currentUserId = action.payload.currentUserId;
        if (currentUserId) {
          state.likedByUser = state.likedUsers.some(user => user._id === currentUserId);
        }
      })
      .addCase(fetchPostLikes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch likes";
      });
  },
});

export const { resetLikeState } = likeSlice.actions;

export default likeSlice.reducer;
