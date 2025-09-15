
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosNodeClient } from "../../services/axiosInstance.js";
import { logout } from "./authSlice.jsx";

const initialState = {
  profile: {},
  loading: false,
  error: null,
  suggestedUsers: null,
  profileByParams: {},
  searchResults: [],
  searchLoading: false,
  searchError: null,
};

// Fetch profile
export const fetchProfile = createAsyncThunk("user/fetch-profile", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.get("/user/profile");
    return res.data.user;
  } catch (error) {
    return rejectWithValue(error?.message);
  }
});

// Suggested users
export const getSuggestedUsers = createAsyncThunk("user/getsuggested", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.get("/user/suggested-users");
    return res.data.users;
  } catch (error) {
    return rejectWithValue(error?.message);
  }
});

// Profile by username
export const getProfileByParams = createAsyncThunk("user/getProfileByParams", async (userName, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.get(`/user/get-profile/${userName}`);
    return res.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Edit profile
export const editProfile = createAsyncThunk("user/editProfile", async (formData, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.put("/user/editProfile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Search users
export const searchUsers = createAsyncThunk("user/searchUsers", async (searchQuery, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.get(`/user/search?q=${encodeURIComponent(searchQuery)}`);
    return res.data.users;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Toggle follow/unfollow
export const toggleFollowUser = createAsyncThunk("user/toggleFollowUser", async (targetUserId, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.post("/user/followUser", { targetUserId });
    return res.data; // return full payload: { action, currentUserFollowing, targetUserFollowers }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearProfileByParams: (state) => {
      state.profileByParams = {};
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.profile = action.payload; state.loading = false; })
      .addCase(fetchProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(logout.fulfilled, (state) => { state.profile = null; state.loading = false; state.error = null; })

      // Suggested users
      .addCase(getSuggestedUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getSuggestedUsers.fulfilled, (state, action) => { state.suggestedUsers = action.payload; state.loading = false; })
      .addCase(getSuggestedUsers.rejected, (state, action) => { state.suggestedUsers = null; state.loading = false; state.error = action.payload; })

      // Profile by params
      .addCase(getProfileByParams.pending, (state) => { state.loading = true; state.profileByParams = null; })
      .addCase(getProfileByParams.fulfilled, (state, action) => { state.profileByParams = action.payload; state.loading = false; })
      .addCase(getProfileByParams.rejected, (state, action) => { state.profileByParams = null; state.loading = false; state.error = action.payload; })

      // Edit profile
      .addCase(editProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(editProfile.fulfilled, (state, action) => { state.profile = action.payload; state.loading = false; })
      .addCase(editProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Search users
      .addCase(searchUsers.pending, (state) => { state.searchLoading = true; state.searchError = null; })
      .addCase(searchUsers.fulfilled, (state, action) => { state.searchResults = action.payload; state.searchLoading = false; })
      .addCase(searchUsers.rejected, (state, action) => { state.searchResults = []; state.searchLoading = false; state.searchError = action.payload; })

      // Toggle follow
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        const { currentUserFollowing } = action.payload;
        state.profile.following = currentUserFollowing || state.profile.following;
      })
      .addCase(toggleFollowUser.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearProfileByParams, clearSearchResults } = userSlice.actions;
export default userSlice.reducer;
