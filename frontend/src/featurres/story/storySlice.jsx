import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosNodeClient } from "../../services/axiosInstance";

const initialState = {
  story: null,         // last uploaded or selected story
  allStories: [],      // feed stories (logged-in + following)
  userStories: {},     // cache of userId -> stories[]
  loading: false,
  error: null,
};

// 📌 Upload Story
export const uploadStory = createAsyncThunk(
  "story/upload",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.post("/story/uploadStory", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.story;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 📌 Get All Stories (logged-in + following)
export const getAllStories = createAsyncThunk(
  "story/getAllStories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.get("/story/getAllStories");
      return res.data.stories;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get Story by ID (with likes/comments)
export const getStoryById = createAsyncThunk(
  "story/getStoryById",
  async (storyId, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.get(`/story/getStoryDetails/${storyId}`);
      console.log(res.data)
      return res.data.story;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// 📌 Get Stories of a Particular User
export const getUserStories = createAsyncThunk(
  "story/getUserStories",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.get(`/story/user/${userId}`);
      return { userId, stories: res.data.stories };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 📌 Delete Story
export const deleteStory = createAsyncThunk(
  "story/deleteStory",
  async (storyId, { rejectWithValue }) => {
    try {
      await axiosNodeClient.delete(`/story/deleteStory/${storyId}`);
      return storyId; // return only ID for filtering
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


// 📌 Mark Story Viewed
export const markStoryViewed = createAsyncThunk(
  "story/markViewed",
  async (storyId, { rejectWithValue }) => {
    try {
      await axiosNodeClient.put(`/story/view/${storyId}`);
      return storyId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const storySlice = createSlice({
  name: "story",
  initialState,
  reducers: {
    clearStoryError: (state) => {
      state.error = null;
    },
    clearStory: (state) => {
      state.story = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload story
      .addCase(uploadStory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadStory.fulfilled, (state, action) => {
        state.loading = false;
        state.story = action.payload;
        state.allStories.unshift(action.payload); // instantly add to feed
      })
      .addCase(uploadStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get all stories
      .addCase(getAllStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllStories.fulfilled, (state, action) => {
        state.loading = false;
        state.allStories = action.payload;
      })
      .addCase(getAllStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get user stories
      .addCase(getUserStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserStories.fulfilled, (state, action) => {
        state.loading = false;
        state.userStories[action.payload.userId] = action.payload.stories;
      })
      .addCase(getUserStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // get story by id with info
      builder
      .addCase(getStoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.story = action.payload;
      })
      .addCase(getStoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete story
      .addCase(deleteStory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.loading = false;
        state.allStories = state.allStories.filter(
          (story) => story._id !== action.payload
        );
        // also remove from userStories cache
        for (const uid in state.userStories) {
          state.userStories[uid] = state.userStories[uid].filter(
            (story) => story._id !== action.payload
          );
        }
      })
      .addCase(deleteStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark story viewed
      .addCase(markStoryViewed.fulfilled, (state, action) => {
        const storyId = action.payload;
        // optimistically update in allStories
        state.allStories = state.allStories.map((story) =>
          story._id === storyId
            ? { ...story, viewed: true } // you can adjust this flag in UI
            : story
        );
      });
  },
});

export const { clearStoryError, clearStory } = storySlice.actions;

export default storySlice.reducer;
