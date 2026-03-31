import {Box} from '@mui/material';

export default function PageWrapper({children, withImage = false}) {
    return (
        <Box sx={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#020617',
            ...(withImage && {
                backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.6), rgba(2, 6, 23, 0.6)), url('/bg-geometric-1.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            })
        }}>
            {children}
        </Box>
    );
}