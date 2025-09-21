



import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    msgNotifications: [], // array of messages
    unreadUsers: [],      // array of userIds with unread messages
};

const msgNotiSlice = createSlice({
    name: "msgNotifications",
    initialState,
    reducers: {

        addNotificationMsg: (state, action) => {
            const { senderId, message } = action.payload;
            console.log("🔥 addNotificationMsg received:", action.payload);

            if (!senderId) return;

            const senderIdStr = String(senderId); // always force string
            console.log("✅ normalized senderId:", senderIdStr);

            state.msgNotifications.unshift({ senderId: senderIdStr, message });

            if (!state.unreadUsers.includes(senderIdStr)) {
                state.unreadUsers.push(senderIdStr);
                console.log("📩 Added unread user:", senderIdStr);
            }
        },



        markUserReadMsg: (state, action) => {
            const userId = action.payload;
            state.unreadUsers = state.unreadUsers.filter((id) => id !== userId);
            state.msgNotifications = state.msgNotifications.filter(
                (msg) => msg.senderId !== userId
            );
        },

        clearAllNoti: (state) => {
            state.msgNotifications = [];
            state.unreadUsers = [];
        },
    },
});

export const { addNotificationMsg, markUserReadMsg, clearAllNoti } = msgNotiSlice.actions;
export default msgNotiSlice.reducer;
