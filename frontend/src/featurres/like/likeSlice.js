import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosNodeClient } from "../../services/axiosInstance.js";

// ✅ Initial state
const initialState = {
  likeCount: 0,              // Total likes of the post
  likedByUser: false,        // Whether current user liked this post
  likedUsers: [],            // List of users who liked the post
  storyLikeCount: 0,         // Total likes of the story
  storyLikedByUser: false,   // Whether current user liked this story
  storyLikedUsers: [],       // List of users who liked the story
  loading: false,
  error: null,
};

// 🔹 Toggle like/unlike a post
export const toggleLikePost = createAsyncThunk(
  "like/togglePost",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.post(`/like/post/like/${postId}`);
      return { postId, message: res.data?.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || "Failed to toggle like");
    }
  }
);

// 🔹 Fetch all users who liked a post
export const fetchPostLikes = createAsyncThunk(
  "like/fetchPostLikes",
  async ({ postId, currentUserId }, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.get(`/like/post/getUserWhoLiked/${postId}`);
      return {
        postId,
        users: res.data?.users || [],
        totalLikes: res.data?.totalLikes || 0,
        currentUserId,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || "Failed to fetch post likes");
    }
  }
);

// 🔹 Toggle like/unlike a story
export const toggleLikeStory = createAsyncThunk(
  "like/toggleStory",
  async (storyId, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.post(`/like/story/like/${storyId}`);
      return { storyId, message: res.data?.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || "Failed to toggle story like");
    }
  }
);

// 🔹 Fetch all users who liked a story
export const fetchStoryLikes = createAsyncThunk(
  "like/fetchStoryLikes",
  async ({ storyId, currentUserId }, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.get(`/like/story/getUserWhoLikedStory/${storyId}`);
      return {
        storyId,
        users: res.data?.users || [],
        totalLikes: res.data?.totalLikes || 0,
        currentUserId,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || "Failed to fetch story likes");
    }
  }
);

const likeSlice = createSlice({
  name: "like",
  initialState,
  reducers: {
    // ✅ Reset state (useful when switching posts or stories)
    resetLikeState: (state) => {
      state.likeCount = 0;
      state.likedByUser = false;
      state.likedUsers = [];
      state.storyLikeCount = 0;
      state.storyLikedByUser = false;
      state.storyLikedUsers = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Toggle Post Like
      .addCase(toggleLikePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleLikePost.fulfilled, (state) => {
        state.loading = false;
        state.likedByUser = !state.likedByUser;
        state.likeCount += state.likedByUser ? 1 : -1;
      })
      .addCase(toggleLikePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Fetch Post Likes
      .addCase(fetchPostLikes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostLikes.fulfilled, (state, action) => {
        state.loading = false;
        state.likedUsers = action.payload.users;
        state.likeCount = action.payload.totalLikes;
        state.likedByUser = action.payload.users.some(
          (user) => user._id === action.payload.currentUserId
        );
      })
      .addCase(fetchPostLikes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Toggle Story Like
      .addCase(toggleLikeStory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleLikeStory.fulfilled, (state) => {
        state.loading = false;
        state.storyLikedByUser = !state.storyLikedByUser;
        state.storyLikeCount += state.storyLikedByUser ? 1 : -1;
      })
      .addCase(toggleLikeStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Fetch Story Likes
      .addCase(fetchStoryLikes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoryLikes.fulfilled, (state, action) => {
        state.loading = false;
        state.storyLikedUsers = action.payload.users;
        state.storyLikeCount = action.payload.totalLikes;
        state.storyLikedByUser = action.payload.users.some(
          (user) => user._id === action.payload.currentUserId
        );
      })
      .addCase(fetchStoryLikes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetLikeState } = likeSlice.actions;
export default likeSlice.reducer;
