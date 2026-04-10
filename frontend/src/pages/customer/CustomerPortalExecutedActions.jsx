import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Box, Card, CardContent, Container, Fade, Grid, Skeleton, Stack, Typography, Divider} from '@mui/material';
import {HistoryEdu} from '@mui/icons-material';
import {getCustomerPortalExecutedActions} from '@/api';
import dayjs from 'dayjs';

export default function CustomerExecutedActions() {
    const {tenantUri} = useParams();
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await getCustomerPortalExecutedActions(tenantUri);
                setActions(res.data || []);
            } catch (err) {
                console.error("Failed to fetch executed actions", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [tenantUri]);

    const formatValue = (attr) => {
        if (!attr.values || attr.values.length === 0) return '—';

        if (attr.isList) {
            return attr.values
                .map(v => String(v).trim())
                .filter(v => v !== "" && v !== ",")
                .join(', ')
                .replace(/,$/, '');
        }

        const val = attr.values[0];
        if (attr.valueType === 'DATE') return dayjs(val).format('HH:mm DD/MM/YYYY');
        if (attr.valueType === 'BOOLEAN') return val === 'true' ? 'true' : 'false';
        return val;
    };

    return (
        <Fade in timeout={800}>
            <Container maxWidth="xl" sx={{pb: 10, pt: 4}}>

                {/* Standard Profile-style Header */}
                <Box sx={{mb: 6}}>
                    <Typography variant="h3" fontWeight={900} sx={{
                        color: '#fff',
                        letterSpacing: -1.5,
                        background: 'linear-gradient(to bottom, #fff 30%, rgba(255,255,255,0.5) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Activity Log
                    </Typography>
                    <Typography variant="h6" sx={{color: '#64748b', mt: 1}}>
                        View your history of executed actions and processes
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Skeleton variant="rounded" height={200}
                                          sx={{bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '24px'}}/>
                            </Grid>
                        ))
                    ) : actions.length === 0 ? (
                        <Grid item xs={12}>
                            <Typography sx={{color: '#475569', textAlign: 'center', mt: 4}}>No activity found.</Typography>
                        </Grid>
                    ) : (
                        actions.map((action) => (
                            <Grid item xs={12} sm={6} md={4} key={action.id}>
                                <Card sx={{
                                    bgcolor: 'rgba(15, 23, 42, 0.4)',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    backdropFilter: 'blur(20px)',
                                    height: '100%',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        borderColor: 'rgba(99, 102, 241, 0.4)'
                                    }
                                }}>
                                    <CardContent sx={{p: 4}}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                            <Box sx={{
                                                p: 1.5,
                                                borderRadius: '12px',
                                                bgcolor: 'rgba(129, 140, 248, 0.1)'
                                            }}>
                                                <HistoryEdu sx={{fontSize: '2rem', color: '#818cf8'}}/>
                                            </Box>
                                        </Stack>

                                        <Typography variant="h5" sx={{
                                            color: '#fff',
                                            fontWeight: 900,
                                            mb: 3,
                                            textTransform: 'lowercase'
                                        }}>
                                            {action.name}
                                        </Typography>

                                        <Stack spacing={2}>
                                            {action.attributes.map((attr, idx) => (
                                                <Box key={attr.attributeId}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                                        <Typography sx={{
                                                            color: '#64748b',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: 1
                                                        }}>
                                                            {attr.name}
                                                        </Typography>
                                                        <Typography sx={{
                                                            color: attr.valueType === 'BOOLEAN' && attr.values[0] === 'true' ? '#818cf8' : '#fff',
                                                            fontWeight: 600,
                                                            fontSize: '0.9rem',
                                                            textAlign: 'right'
                                                        }}>
                                                            {formatValue(attr)}
                                                        </Typography>
                                                    </Stack>
                                                    {idx !== action.attributes.length - 1 && (
                                                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.03)', mt: 1.5 }} />
                                                    )}
                                                </Box>
                                            ))}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>
        </Fade>
    );
}