import {Navigate, useParams} from 'react-router-dom';
import {useAuth} from '@/hooks/useAuth';
import {Box, CircularProgress} from '@mui/material';

export default function ProtectedRoute({children}) {
    const {user, loading} = useAuth();
    const {tenantUri} = useParams();

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
        return <Navigate to={`/${tenantUri}/login`} replace/>;
    }

    return children;
}