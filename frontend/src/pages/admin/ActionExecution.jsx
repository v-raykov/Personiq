import React from 'react';
import {useParams} from 'react-router-dom';
import {
    alpha,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Fade,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import {PersonOutline, RocketLaunch, SettingsSuggest, TuneOutlined} from '@mui/icons-material';
import {useActionExecution} from '@/hooks/useActionExecution.js';
import {useCustomerData} from '@/hooks/useCustomerData.js';
import AttributeField from '@/components/shared/AttributeField.jsx';
import {glassInputStyles} from '@/styles/formStyles.js';

export default function ActionExecution() {
    const {tenantUri} = useParams();
    const {customers} = useCustomerData(tenantUri);

    const {
        actions,
        selectedAction,
        formData,
        loading,
        handleActionChange,
        updateAttribute,
        submit
    } = useActionExecution(tenantUri);

    const onExecute = async () => {
        const target = customers?.find(c => c.customerId === formData.targetCustomerId);
        if (!target) return alert("Please select a valid customer");
        try {
            const execId = await submit(target.customerId);
            if (execId) alert(`Success! Action Executed: ${execId}`);
        } catch (err) {
            console.error(err);
        }
    };

    const sectionHeaderStyle = (color) => ({
        color: alpha('#fff', 0.5),
        fontWeight: 800,
        fontSize: '0.7rem',
        letterSpacing: 2,
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        '& .MuiSvgIcon-root': {color: color, fontSize: '1.2rem'}
    });

    return (
        <Fade in timeout={800}>
            <Box sx={{width: '100%', pb: 10, px: 2, position: 'relative'}}>
                <Box sx={{
                    position: 'absolute',
                    top: -100,
                    right: '10%',
                    width: 400,
                    height: 400,
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
                    zIndex: -1,
                    filter: 'blur(60px)'
                }}/>

                <Box sx={{mb: 6}}>
                    <Typography variant="h3" fontWeight={900} sx={{
                        color: '#fff',
                        letterSpacing: -1.5,
                        background: 'linear-gradient(to bottom, #fff 30%, rgba(255,255,255,0.5) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Action Runner
                    </Typography>
                    <Typography variant="h6" sx={{color: '#64748b', mt: 1, fontWeight: 400}}>
                        Trigger manual logic for <span style={{color: '#fff'}}>{tenantUri}</span>
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid slotprops={{root: {xs: 12, md: 5}}}>
                        <Stack spacing={3}>
                            <Card sx={{
                                bgcolor: 'rgba(15, 23, 42, 0.4)',
                                borderRadius: '28px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                            }}>
                                <CardContent sx={{p: 4}}>
                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography sx={sectionHeaderStyle('#818cf8')} mb={2.5}>
                                                <SettingsSuggest/> 1. Select Action
                                            </Typography>
                                            <TextField
                                                select fullWidth
                                                label="Action Type"
                                                sx={glassInputStyles}
                                                value={selectedAction?.id || ''}
                                                onChange={(e) => handleActionChange(actions.find(a => a.id === e.target.value))}
                                            >
                                                {actions.map(a => (
                                                    <MenuItem key={a.id} value={a.id} sx={{py: 1.5}}>{a.name}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Box>

                                        <Box>
                                            <Typography sx={sectionHeaderStyle('#10b981')} mb={3}>
                                                <PersonOutline/> 2. Target Customer
                                            </Typography>
                                            <Autocomplete
                                                options={customers || []}
                                                getOptionLabel={(o) => `${o.username} (ID: ${o.customerId})`}
                                                onChange={(_, val) => updateAttribute('targetCustomerId', val?.customerId)}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Search Customer"
                                                               sx={glassInputStyles}/>
                                                )}
                                                sx={{
                                                    '& .MuiAutocomplete-paper': {
                                                        bgcolor: '#1e293b',
                                                        color: '#fff',
                                                        borderRadius: '16px'
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>

                    <Grid slotprops={{root: {xs: 12, md: 7}}}>
                        {selectedAction ? (
                            <Card sx={{
                                bgcolor: 'rgba(15, 23, 42, 0.4)',
                                borderRadius: '28px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                position: 'relative',
                                overflow: 'visible'
                            }}>
                                <CardContent sx={{p: 4}}>
                                    <Typography sx={sectionHeaderStyle('#f59e0b')} mb={4}>
                                        <TuneOutlined/> 3. Configure Parameters
                                    </Typography>

                                    <Stack spacing={2.5}>
                                        {selectedAction.attributes?.map(attr => (
                                            <AttributeField
                                                key={attr.id}
                                                label={attr.name}
                                                vType={attr.valueType}
                                                isList={attr.isList}
                                                value={formData[attr.id] ?? ''}
                                                onChange={(val) => updateAttribute(attr.id, val)}
                                            />
                                        ))}

                                        <Divider sx={{my: 3, borderColor: 'rgba(255,255,255,0.05)'}}/>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={onExecute}
                                            disabled={loading || !formData.targetCustomerId}
                                            startIcon={!loading && <RocketLaunch/>}
                                            sx={{
                                                height: 68,
                                                borderRadius: '20px',
                                                fontWeight: 900,
                                                fontSize: '1.1rem',
                                                letterSpacing: 1,
                                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                                boxShadow: '0 12px 30px rgba(99, 102, 241, 0.4)',
                                                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 15px 40px rgba(99, 102, 241, 0.6)',
                                                    filter: 'brightness(1.2)'
                                                },
                                                '&:active': {transform: 'translateY(0)'},
                                                '&:disabled': {opacity: 0.2, background: 'rgba(255,255,255,0.05)'}
                                            }}
                                        >
                                            {loading ? 'PROCESSING...' : 'EXECUTE ACTION'}
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ) : (
                            <Box sx={{
                                height: 450,
                                border: '2px dashed rgba(255,255,255,0.1)',
                                borderRadius: '28px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                gap: 2,
                                p: 4,
                                bgcolor: 'rgba(255,255,255,0.01)'
                            }}>
                                <SettingsSuggest sx={{fontSize: '3rem', color: 'rgba(255,255,255,0.05)'}}/>
                                <Typography sx={{color: '#475569', fontWeight: 500, fontSize: '1.1rem', maxWidth: 300}}>
                                    Configuration will appear once an action is selected
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </Fade>
    );
}