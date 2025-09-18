import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosNodeClient } from "../../services/axiosInstance";

const initialState = {
  loading: false,
  error: null,
  postComments: {},   // { postId: { comments: [], count: 0 } }
  storyComments: {},  // { storyId: { comments: [], count: 0 } }
};

// -------------------- ASYNC THUNKS --------------------

// Add top-level comment
export const addComment = createAsyncThunk(
  "comment/addComment",
  async ({ contentType, contentId, content }, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.post(
        `/comment/addComment/${contentType}/${contentId}`,
        { content }
      );
      return { data: res.data, contentType, contentId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add reply to a comment
export const addReply = createAsyncThunk(
  "comment/addReply",
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.post(
        `/comment/replyComment/${commentId}`,
        { content }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get all comments for a post or story
export const getAllComments = createAsyncThunk(
  "comment/getAllComments",
  async ({ contentType, contentId }, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.get(
        `/comment/getComments/${contentType}/${contentId}`
      );
      return {
        comments: res.data.comments,
        count: res.data.commentCount,
        contentType,
        contentId,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const deleteComment = createAsyncThunk(
  "comment/deleteComment",
  async ({ commentId, contentType, contentId }, { rejectWithValue }) => {
    try {
      const res = await axiosNodeClient.delete(`/comment/deleteComment/${commentId}`);
      return { ...res.data, commentId, contentType, contentId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// -------------------- SLICE --------------------
export const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    resetCommentState: (state) => {
      state.postComments = {};
      state.storyComments = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Add comment
    builder
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        const { data, contentType, contentId } = action.payload;
        if (contentType === "Post") {
          if (!state.postComments[contentId]) {
            state.postComments[contentId] = { comments: [], count: 0 };
          }
          state.postComments[contentId].comments.unshift(data.comment);
          state.postComments[contentId].count = data.commentCount;
        } else if (contentType === "Story") {
          if (!state.storyComments[contentId]) {
            state.storyComments[contentId] = { comments: [], count: 0 };
          }
          state.storyComments[contentId].comments.unshift(data.comment);
          state.storyComments[contentId].count = data.commentCount;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add reply
    builder
      .addCase(addReply.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReply.fulfilled, (state) => {
        state.loading = false;
        // Reply should already be handled on backend, so we refetch or ignore here
      })
      .addCase(addReply.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get all comments
    builder
      .addCase(getAllComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllComments.fulfilled, (state, action) => {
        state.loading = false;
        const { comments, count, contentType, contentId } = action.payload;
        if (contentType === "Post") {
          state.postComments[contentId] = { comments, count };
        } else if (contentType === "Story") {
          state.storyComments[contentId] = { comments, count };
        }
      })
      .addCase(getAllComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete comment
    builder
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      

      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        const { commentId, contentType, contentId, commentCount } = action.payload;

        if (contentType === "Post") {
          const postData = state.postComments[contentId];
          if (postData) {
            postData.comments = postData.comments.filter(c => c._id !== commentId);
            // Also remove from replies if it's a reply
            postData.comments.forEach(c => {
              c.replies = c.replies?.filter(r => r._id !== commentId) || [];
            });
            postData.count = commentCount ?? postData.count - 1;
          }
        }

        if (contentType === "Story") {
          const storyData = state.storyComments[contentId];
          if (storyData) {
            storyData.comments = storyData.comments.filter(c => c._id !== commentId);
            storyData.comments.forEach(c => {
              c.replies = c.replies?.filter(r => r._id !== commentId) || [];
            });
            storyData.count = commentCount ?? storyData.count - 1;
          }
        }
      })

      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCommentState } = commentSlice.actions;
export default commentSlice.reducer;
