import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosNodeClient } from "../../services/axiosInstance";

const initialState = {
  followersList: [],
  followingList: [],
  loading: false,
  error: null,
};

// 🔹 Fetch Followers
export const getFollowers = createAsyncThunk(
  "follow/getFollowers",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.get(`/user/getFollowers/${userId}`);
      return await res.data.followers;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Fetch Following
export const getFollowing = createAsyncThunk(
  "follow/getFollowing",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.get(`/user/getFollowing/${userId}`);
      return await res.data.following;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const followSlice = createSlice({
  name: "follow",
  initialState,
  reducers: {
    clearFollowData: (state) => {
      state.followersList = [];
      state.followingList = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Followers
      .addCase(getFollowers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followersList = action.payload;
      })
      .addCase(getFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Following
      .addCase(getFollowing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFollowing.fulfilled, (state, action) => {
        state.loading = false;
        state.followingList = action.payload;
      })
      .addCase(getFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFollowData } = followSlice.actions;
export default followSlice.reducer;
