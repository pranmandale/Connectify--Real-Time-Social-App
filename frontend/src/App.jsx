import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import AppRoutes from "./routes/index"
import Loader from './components/Loader';
import { refreshToken } from './featurres/users/authSlice';
import { fetchProfile, getSuggestedUsers } from './featurres/users/userSlice';
import { getAllPostsOfUser, getPostById } from './featurres/post/postSlice';
import { addNotification, fetchNotifications } from './featurres/notifications/notificationSlice';
import { initSocket } from './socket';
import { addNotificationMsg } from './featurres/msgNotifications/msgNotiSlice';



const App = () => {
  const { isAuthenticated, isInitialized } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [isAppReady, setIsAppReady] = useState(false);
  const { profile } = useSelector(state => state.user)


  // here we call refresh token to generate new access token
  // bcoz when we refresh the page the value of isAuthenticated is bocomes false
  // by generating new access token the value beoomes true
  useEffect(() => {
    dispatch(refreshToken()).finally(() => {
      setIsAppReady(true);
    });
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
      dispatch(getSuggestedUsers());

    }
  }, [dispatch, isAuthenticated]);

  // 👇 socket integration for real-time notifications for comments, follow
  useEffect(() => {
    if (!profile?._id) return;

    // 🔹 Fetch existing notifications on login
    dispatch(fetchNotifications());

    const socket = initSocket(profile._id);

    socket.on("getNotification", (notification) => {
      dispatch(addNotification(notification));
    });



    return () => {
      socket.off("getNotification");
    };
  }, [dispatch, profile?._id]);


  // for message notification socket integration

useEffect(() => {
  if (!profile?._id) return;

  const socket = initSocket(profile._id);

  socket.on("chatMessage", (message) => {
    console.log("📨 Global chatMessage received:", message);

    const senderId = String(message.senderId?._id || message.senderId);

    // Don’t mark self-messages as unread
    if (senderId !== String(profile._id)) {
      dispatch(addNotificationMsg({ senderId, message: message.message }));
    }
  });

  return () => {
    socket.off("chatMessage");
  };
}, [dispatch, profile?._id]);





  if (!isInitialized || !isAppReady) {
    return (
      <div className="h-screen text-3xl flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <AppRoutes isAuthenticated={isAuthenticated} />
    </div>
  )
}

export default App