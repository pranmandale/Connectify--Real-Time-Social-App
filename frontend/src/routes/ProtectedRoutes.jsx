import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector(state => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />; // redirect to login
    }

    return children; // render the protected component
};

export default ProtectedRoute;
