import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Box, Card, CardContent, Chip, Container, Fade, Grid, Skeleton, Stack, Typography} from '@mui/material';
import {Abc, CalendarToday, Numbers, ToggleOn, ViewList} from '@mui/icons-material';
import {getCustomerPortalAttributeValues} from '@/api';
import dayjs from 'dayjs';

export default function CustomerPortalAttributeValues() {
    const {tenantUri} = useParams();
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await getCustomerPortalAttributeValues(tenantUri);
                setAttributes(res.data || []);
            } catch (err) {
                console.error("Failed to fetch portal attributes", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [tenantUri]);

    const getIcon = (type) => {
        const style = {fontSize: '2rem', color: '#818cf8'};
        switch (type) {
            case 'NUMBER':
                return <Numbers sx={style}/>;
            case 'DATE':
                return <CalendarToday sx={style}/>;
            case 'BOOLEAN':
                return <ToggleOn sx={style}/>;
            default:
                return <Abc sx={style}/>;
        }
    };

    const renderValueContent = (attr) => {
        const hasValues = attr.values && attr.values.length > 0 && attr.values.every(v => v.trim() !== "");

        if (!hasValues) {
            return (
                <Typography sx={{color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', fontSize: '0.85rem'}}>
                    {attr.isList ? 'empty' : 'no value set'}
                </Typography>
            );
        }

        return (
            <Stack spacing={0.5}>
                {attr.values.map((val, vIdx) => {
                    const displayValue = attr.valueType === 'DATE'
                        ? dayjs(val).format('HH:mm DD/MM/YYYY')
                        : val;

                    return (
                        <Typography key={vIdx} variant="h6" sx={{color: '#fff', fontWeight: 600, lineHeight: 1.2}}>
                            {displayValue}
                        </Typography>
                    );
                })}
            </Stack>
        );
    };

    return (
        <Fade in timeout={800}>
            <Container maxWidth="xl" sx={{pb: 10, pt: 4}}>
                <Box sx={{mb: 6}}>
                    <Typography variant="h3" fontWeight={900} sx={{
                        color: '#fff',
                        letterSpacing: -1.5,
                        background: 'linear-gradient(to bottom, #fff 30%, rgba(255,255,255,0.5) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        My Profile
                    </Typography>
                    <Typography variant="h6" sx={{color: '#64748b', mt: 1}}>
                        View your personal data and attributes
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {loading ? (
                        [1, 2, 3, 4].map((i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Skeleton variant="rounded" height={160}
                                          sx={{bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '24px'}}/>
                            </Grid>
                        ))
                    ) : (
                        attributes.map((attr, idx) => (
                            <Grid item xs={12} sm={6} md={4} key={attr.attributeId || idx}>
                                <Card sx={{
                                    bgcolor: 'rgba(15, 23, 42, 0.4)',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    backdropFilter: 'blur(20px)',
                                    height: '100%',
                                    transition: 'transform 0.2s',
                                    '&:hover': {transform: 'translateY(-5px)', borderColor: 'rgba(99, 102, 241, 0.4)'}
                                }}>
                                    <CardContent sx={{p: 4}}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start"
                                               mb={2}>
                                            <Box sx={{
                                                p: 1.5,
                                                borderRadius: '12px',
                                                bgcolor: 'rgba(129, 140, 248, 0.1)'
                                            }}>
                                                {getIcon(attr.valueType)}
                                            </Box>
                                            {attr.isList && (
                                                <Chip
                                                    icon={<ViewList style={{color: '#818cf8', fontSize: '1rem'}}/>}
                                                    label="List"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(129, 140, 248, 0.1)',
                                                        color: '#818cf8',
                                                        fontWeight: 800
                                                    }}
                                                />
                                            )}
                                        </Stack>

                                        <Typography variant="caption" sx={{
                                            color: '#64748b',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: 1
                                        }}>
                                            {attr.name}
                                        </Typography>

                                        <Box sx={{mt: 1.5}}>
                                            {renderValueContent(attr)}
                                        </Box>
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