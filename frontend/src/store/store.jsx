import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../featurres/users/authSlice";
import tokenReducer from "../featurres/token/tokenSlice"

const rootReducers = {
    auth: authReducer,
    token : tokenReducer,
}

export const store = configureStore ({
    reducer : rootReducers,
    middleware : (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck : false,
        }),
    
})

export default store;