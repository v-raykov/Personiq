import {Navigate, useLocation, useParams} from 'react-router-dom';
import {useAuth} from '@/hooks/useAuth';
import {Box, CircularProgress} from '@mui/material';

export default function ProtectedRoute({children, requiredRole}) {
    const {user, loading} = useAuth();
    const {tenantUri} = useParams();
    const location = useLocation();

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: '#0f172a'
            }}>
                <CircularProgress sx={{color: '#818cf8'}}/>
            </Box>
        );
    }

    if (!user) {
        return <Navigate to={`/${tenantUri}/login`} state={{from: location}} replace/>;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to={`/${tenantUri}/account`} replace/>;
    }

    return children;
}