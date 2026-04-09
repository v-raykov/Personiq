import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {Box, Fade, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material';
import CustomerAttributes from '@/pages/admin/CustomerAttributes.jsx';
import CustomerAttributesValues from '@/pages/admin/CustomerAttributesValues.jsx';

const CustomerWrapper = () => {
    const {tenantUri} = useParams();
    const [view, setView] = useState('values');

    const handleViewChange = (event, nextView) => {
        if (nextView !== null) {
            setView(nextView);
        }
    };

    return (
        <Fade in timeout={800}>
            <Box sx={{maxWidth: 1300, mx: 'auto', p: 4}}>

                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6}}>
                    <Box>
                        <Typography variant="h3" fontWeight={900} sx={{color: '#fff', letterSpacing: -1.5}}>
                            Customer Attributes
                        </Typography>
                        <Typography variant="h6" sx={{color: '#94a3b8', mt: 1, fontWeight: 400}}>
                            Manage global definitions and values for {tenantUri?.replace('-', ' ')} customers
                        </Typography>
                    </Box>

                    <ToggleButtonGroup
                        value={view}
                        exclusive
                        onChange={handleViewChange}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px',
                            p: 0.5,
                            '& .MuiToggleButton-root': {
                                color: '#94a3b8',
                                border: 'none',
                                borderRadius: '16px',
                                px: 4,
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                transition: '0.3s',
                                '&.Mui-selected': {
                                    bgcolor: '#6366f1',
                                    color: '#fff',
                                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                                    '&:hover': {bgcolor: '#4f46e5'}
                                },
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    color: '#fff'
                                }
                            }
                        }}
                    >
                        <ToggleButton value="values">
                            Values
                        </ToggleButton>
                        <ToggleButton value="definitions">
                            Definitions
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Box>
                    {view === 'values' ? (
                        <CustomerAttributesValues/>
                    ) : (
                        <CustomerAttributes/>
                    )}
                </Box>
            </Box>
        </Fade>
    );
};

export default CustomerWrapper;