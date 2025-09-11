import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { axiosNodeClient } from "../../services/axiosInstance.js"
import { logout } from "./authSlice.jsx"

const initialState = {
  profile: {},
  loading: false,
  error: null,
  suggestedUsers: null,
  profileByParams: {},
}

export const fetchProfile = createAsyncThunk("user/fetch-profile", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.get("/user/profile")
    console.log(res.data.user)
    return res.data.user
  } catch (error) {
    return rejectWithValue(error?.message)
  }
})

export const getSuggestedUsers = createAsyncThunk("user/getsuggested", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosNodeClient.get("/user/suggested-users")
    return res.data.users
  } catch (error) {
    return rejectWithValue(error?.message)
  }
})

export const getProfileByParams = createAsyncThunk("user/getProfileByParams", async (userName, { rejectWithValue }) => {
  try {
    // ✅ use backticks, not quotes
    const res = await axiosNodeClient.get(`/user/get-profile/${userName}`)
    console.log("params user", res.data.user)
    return res.data.user
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearProfileByParams: (state) => {
      state.profileByParams = {}
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action?.payload
        state.loading = false
        state.error = null
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action?.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.profile = null
        state.loading = false
        state.error = null
      })
      .addCase(getSuggestedUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSuggestedUsers.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.suggestedUsers = action?.payload
      })
      .addCase(getSuggestedUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action?.payload
        state.suggestedUsers = null
      })
      .addCase(getProfileByParams.pending, (state) => {
        state.loading = true
        state.error = null
        state.profileByParams = null // reset before new fetch
      })
      .addCase(getProfileByParams.fulfilled, (state, action) => {
        state.profileByParams = action.payload
        state.loading = false
      })
      .addCase(getProfileByParams.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.profileByParams = null
      })
  },
})

export const { clearProfileByParams } = userSlice.actions

export default userSlice.reducer
