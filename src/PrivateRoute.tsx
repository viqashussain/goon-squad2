import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from "./firebase";

export const PrivateRoute = () => {
    const [user, loading] = useAuthState(auth);

    useEffect(() => {
        if (loading) {
            // maybe trigger a loading screen
            return;
        }
    }, [user, loading]);

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    return !loading && user ? <Outlet /> : <Navigate to="/login" />;
}