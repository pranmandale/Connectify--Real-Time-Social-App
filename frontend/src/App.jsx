import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from "react-redux"
import AppRoutes from "./routes/index"
import Loader from './components/Loader';
import { refreshToken } from './featurres/users/authSlice';
import { fetchProfile, getSuggestedUsers } from './featurres/users/userSlice';
import { getAllPostsOfUser, getPostById } from './featurres/post/postSlice';


const App = () => {
  const {isAuthenticated, isInitialized} = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  const [isAppReady , setIsAppReady] = useState(false);
  

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


if (!isInitialized || !isAppReady) {
  return (
    <div className="h-screen text-3xl flex justify-center items-center">
      <Loader />
    </div>
  );
}

  return (
    <div>
      <AppRoutes isAuthenticated={isAuthenticated}/>
    </div>
  )
}

export default App