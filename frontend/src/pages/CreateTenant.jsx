import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { createTenant } from '../api';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(8),
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
}));

const BackLink = styled(Link)(({ theme }) => ({
    display: 'inline-block',
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontSize: '0.9rem',
}));

function CreateTenant() {
    const [uriName, setUriName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createTenant(uriName);
            navigate('/');
        } catch (err) {
            alert('Error creating tenant');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 4 }}>
                <BackLink to="/">← Back to Selection</BackLink>
                <StyledPaper elevation={0}>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                        New Instance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Configure a new tenant identifier.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Tenant URI Name"
                            placeholder="e.g. acme-corp"
                            value={uriName}
                            onChange={(e) => setUriName(e.target.value)}
                            required
                            sx={{ mb: 3 }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Provisioning...' : 'Confirm Creation'}
                        </Button>
                    </Box>
                </StyledPaper>
            </Box>
        </Container>
    );
}

export default CreateTenant;