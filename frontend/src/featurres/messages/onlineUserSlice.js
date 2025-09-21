import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    onlineUsers : []
}



const onlineSlice = createSlice({
  name: "online",
  initialState,
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});


export const { setOnlineUsers } = onlineSlice.actions;
export default onlineSlice.reducer;