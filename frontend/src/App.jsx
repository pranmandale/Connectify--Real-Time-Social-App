import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from "react-redux"
import {useLocation} from "react-router-dom";
import {setInitialized} from "./featurres/users/authSlice"
import AppRoutes from "./routes/index"
import Loader from './components/Loader';
import { refreshToken } from './featurres/users/authSlice';


const App = () => {
  const {isAuthenticated, isInitialized} = useSelector(state => state.auth);
  console.log(isAuthenticated)
  const dispatch = useDispatch();
  const location = useLocation();

  const [isAppReady , setIsAppReady] = useState(false);

useEffect(() => {
   dispatch(refreshToken()).finally(() => {
      setIsAppReady(true);
    });
}, [dispatch])


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