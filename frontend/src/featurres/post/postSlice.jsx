import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { axiosNodeClient } from "../../services/axiosInstance.js"

const initialState = {
  posts: [], // all posts
  post: null, // single post detail
  suggestedPosts: [], // suggested posts
  loading: false,
  error: null,
}

// 🔹 Fetch all posts of the logged-in user
export const getAllPostsOfUser = createAsyncThunk("posts/getAll", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.get("/post/post/get-all");
    return res.data // backend sends { message, posts }
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message)
  }
})

// 🔹 Fetch single post by ID
export const getPostById = createAsyncThunk("posts/getById", async (postId, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.get(`/post/posts/${postId}`)
    return res.data // backend sends { message, post }
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message)
  }
})

// 🔹 Upload new post
export const uploadPost = createAsyncThunk("post/post/upload", async (formData, { rejectWithValue }) => {
  try {
    // formData must be FormData with media[] files + text fields
    const res = await axiosNodeClient.post("/post/post/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data // backend sends { message, post }
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message)
  }
})

// 🔹 Update a post
export const updatePost = createAsyncThunk("posts/update", async ({ postId, formData }, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.put(`/post/posts/${postId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message)
  }
})

// 🔹 Delete a post
export const deletePost = createAsyncThunk("/postposts/delete", async (postId, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.delete(`/post/posts/${postId}`)
    return { postId, ...res.data } // return id so reducer can remove it
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message)
  }
})

// 🔹 Get suggested posts
export const getSuggestedPosts = createAsyncThunk("posts/getSuggested", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.get("/post/post/getSuggested");
    console.log(res.data.posts);
    return res.data.posts // backend sends { message, posts }
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message)
  }
})

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET ALL POSTS
      .addCase(getAllPostsOfUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllPostsOfUser.fulfilled, (state, action) => {
        state.loading = false
        state.posts = action.payload.posts || [] // backend likely wraps posts
      })
      .addCase(getAllPostsOfUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // GET POST BY ID
      .addCase(getPostById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPostById.fulfilled, (state, action) => {
        state.loading = false
        state.post = action.payload.post || null
      })
      .addCase(getPostById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // UPLOAD POST
      .addCase(uploadPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload.post) // prepend new post
      })

      // UPDATE POST
      .addCase(updatePost.fulfilled, (state, action) => {
        const updated = action.payload.post
        const idx = state.posts.findIndex((p) => p._id === updated._id)
        if (idx !== -1) state.posts[idx] = updated
        if (state.post?._id === updated._id) state.post = updated
      })

      // DELETE POST
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload.postId)
        if (state.post?._id === action.payload.postId) state.post = null
      })

      // GET SUGGESTED POSTS
      .addCase(getSuggestedPosts.fulfilled, (state, action) => {
        state.suggestedPosts = action.payload || []
      })
  },
})

export default postSlice.reducer
