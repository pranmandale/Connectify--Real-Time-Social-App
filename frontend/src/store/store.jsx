// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "../featurres/users/authSlice";
// import tokenReducer from "../featurres/token/tokenSlice";
// import userReducer from "../featurres/users/userSlice";
// import { injectStore } from "../services/axiosInstance";
// import postReducer from "../featurres/post/postSlice"
// import likeReducer from "../featurres/like/likeSlice"
// import followReducer from "../featurres/follows/followSlice";
// import storyReducer from "../featurres/story/storySlice"
// import commentsReducer from "../featurres/comments/CommentSlice"
// import messageReducer from "../featurres/messages/messageSlice.js"
// import onlineReducer from "../featurres/messages/onlineUserSlice.js"
// import notificationsReducer from "../featurres/notifications/notificationSlice.js"
// import msgNotiReducer from "../featurres/msgNotifications/msgNotiSlice.js"


// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     token: tokenReducer,
//     user: userReducer,
//     post : postReducer,
//     like : likeReducer,
//     follow : followReducer,
//     story : storyReducer,
//     comment : commentsReducer,
//     messages : messageReducer,
//     online : onlineReducer,
//     notifications: notificationsReducer,
//     msgNotifications : msgNotiReducer,
//   },
//   devTools: true,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false,
//     }),
// });

// injectStore(store); // 👈 give axios access to Redux store

// export default store;



import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import { persistReducer, persistStore } from "redux-persist";

import authReducer from "../featurres/users/authSlice";
import tokenReducer from "../featurres/token/tokenSlice";
import userReducer from "../featurres/users/userSlice";
import { injectStore } from "../services/axiosInstance";
import postReducer from "../featurres/post/postSlice"
import likeReducer from "../featurres/like/likeSlice"
import followReducer from "../featurres/follows/followSlice";
import storyReducer from "../featurres/story/storySlice"
import commentsReducer from "../featurres/comments/CommentSlice"
import messageReducer from "../featurres/messages/messageSlice.js"
import onlineReducer from "../featurres/messages/onlineUserSlice.js"
import notificationsReducer from "../featurres/notifications/notificationSlice.js"
import msgNotiReducer from "../featurres/msgNotifications/msgNotiSlice.js"

// ✅ configure persist for msgNotifications
const msgNotiPersistConfig = {
  key: "msgNotifications",
  storage,
};

const persistedMsgNotiReducer = persistReducer(msgNotiPersistConfig, msgNotiReducer);

export const store = configureStore({
  reducer: {
    auth: authReducer,
    token: tokenReducer,
    user: userReducer,
    post: postReducer,
    like: likeReducer,
    follow: followReducer,
    story: storyReducer,
    comment: commentsReducer,
    messages: messageReducer,
    online: onlineReducer,
    notifications: notificationsReducer,
    msgNotifications: persistedMsgNotiReducer, // 👈 persisted
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

injectStore(store);

export const persistor = persistStore(store);
export default store;
