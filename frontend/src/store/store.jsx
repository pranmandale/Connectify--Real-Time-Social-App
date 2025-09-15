import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../featurres/users/authSlice";
import tokenReducer from "../featurres/token/tokenSlice";
import userReducer from "../featurres/users/userSlice";
import { injectStore } from "../services/axiosInstance";
import postReducer from "../featurres/post/postSlice"
import likeReducer from "../featurres/like/likeSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    token: tokenReducer,
    user: userReducer,
    post : postReducer,
    like : likeReducer
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

injectStore(store); // 👈 give axios access to Redux store

export default store;
