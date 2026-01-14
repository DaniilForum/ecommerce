import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getProfile } from '../api/authApi';

const AdminRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const location = useLocation();

    useEffect(() => {
        let cancelled = false;
        const token = localStorage.getItem('authToken');
        if (!token) {
            setLoading(false);
            setIsAdmin(false);
        return;
        }

        (async () => {
        try {
            const res = await getProfile();
            if (!cancelled) setIsAdmin(res.data?.role === 'admin');
        } catch (err) {
            if (!cancelled) setIsAdmin(false);
        } finally {
            if (!cancelled) setLoading(false);
        }
        })();

        return () => { cancelled = true; };
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!localStorage.getItem('authToken')) return <Navigate to="/login" state={{ from: location }} replace />;
    if (!isAdmin) return <Navigate to="/" replace />;

    return children;
};

export default AdminRoute;
