import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosNodeClient } from "../../services/axiosInstance.js";
import { logout } from "./authSlice.jsx";



const initialState = {
    profile : null,
    loading : false,
    error : null,
    suggestedUsers : null
}

export const fetchProfile = createAsyncThunk(
    "user/fetch-profile",
    async(_, {rejectWithValue}) => {
        try {
            const res = await axiosNodeClient.get('/user/profile')
            console.log(res.data.users)
            return res.data.users;
        } catch(error) {
            return rejectWithValue(error?.message)
        }
    }
);

export const getSuggestedUsers = createAsyncThunk(
    "user/getsuggested",
    async(_, {rejectWithValue}) => {
        try {
            const res = await axiosNodeClient.get('/user/suggested-users');
            return res.data.users;

        } catch(error) {
            return rejectWithValue(error?.message)
        }
    }
)


const userSlice = createSlice (
    {
        name: "user",
        initialState,
        extraReducers : (builder) => {
            builder
                .addCase(fetchProfile.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(fetchProfile.fulfilled, (state, action) => {
                    state.profile = action?.payload;
                    state.loading = false;
                    state.error = null;
                })
                .addCase(fetchProfile.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action?.payload;
                })
                .addCase(logout.fulfilled, (state) => {
                state.profile = null;
                state.loading = false;
                state.error = null;
                })
                .addCase(getSuggestedUsers.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(getSuggestedUsers.fulfilled, (state, action) => {
                    state.loading = false;
                    state.error = null;
                    state.suggestedUsers = action?.payload
                })
                .addCase(getSuggestedUsers.rejected , (state, action) => {
                    state.loading = false;
                    state.error = action?.payload;
                    state.suggestedUsers = null;
                })
        }
    }
)


export default userSlice.reducer;