import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"
import { setAccessToken } from "../token/tokenSlice";
import { decodedToken } from "../../utils/decoded.js"


const API_URL = import.meta.env.VITE_NODE_URL;

const initialState = {
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    loading: false,
    error: null
}



export const signUp = createAsyncThunk(
    "auth/signup",
    async (userData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${API_URL}/auth/signup`, userData, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            dispatch(setAccessToken(response.data.accessToken));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message || "server error" });

        }
    }
);


export const login = createAsyncThunk(
    "auth/login",
    async (userData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, userData, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            dispatch(setAccessToken(response.data.accessToken));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message || "server error" });

        }
    }
);

export const refreshToken = createAsyncThunk(
    "auth/refreshToken",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            const { accessToken } = response.data;
            dispatch(setAccessToken(accessToken));
            return response.data;
        } catch (error) {
            dispatch(logout())
            return rejectWithValue(error.response?.data || { message: error.message || "server error" });

        }
    }
)

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            await axios.get(`${API_URL}/auth/logout`, {}, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message || "server error" });

        }
    }
)


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearAuthError: (state) => {
            state.error = null
        },
        setInitialized: (state) => {
            state.isInitialized = true;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(signUp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signUp.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                const accessToken = action.payload.accessToken;
                if (accessToken) {
                    const decoded = decodedToken(accessToken);
                    state.user = decoded.user;
                }
            })
            .addCase(signUp.rejected, (state, action) => {  // ✅ keep action
                state.loading = false;
                state.error = action.payload?.message || "Registration failed";
                state.isAuthenticated = false;
                state.isInitialized = true;
            })
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                const accessToken = action.payload?.accessToken;
                if (accessToken) {
                    const decoded = decodedToken(accessToken);
                    state.user = decoded.user;
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "login failed";
                state.isAuthenticated = false;
                state.isInitialized = true;
            })
            .addCase(refreshToken.pending, (state) => {
                state.loading = true;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                const accessToken = action.payload.accessToken;
                if (accessToken) {
                    const decoded = decodedToken(accessToken);
                    state.user = decoded.user;
                    state.isAuthenticated = true;
                }
                state.loading = false;
                state.isInitialized = true;
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.isInitialized = true;
                if (action.payload?.message) {
                    state.error = action.payload.message;
                } else {
                    state.error = null;
                }
            })
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
                state.isInitialized = true;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload?.message || "Logout failed";
                state.isInitialized = true;
            });
    }
})


export const { clearAuthError } = authSlice.actions;
export const { setInitialized } = authSlice.actions;
export default authSlice.reducer;
