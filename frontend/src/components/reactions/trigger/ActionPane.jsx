import React from 'react';
import {Box, Card, Divider, Stack, Typography} from '@mui/material';
import {Bolt, SettingsInputComponent} from '@mui/icons-material';

export default function ActionPane({metadata, actionId}) {
    const hasAttributes = metadata?.attributes && metadata.attributes.length > 0;

    return (
        <Card sx={{
            p: 4,
            height: 'fit-content',
            width: '100%',
            borderRadius: '32px',
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
        }}>
            <Typography variant="caption"
                        sx={{color: '#10b981', fontWeight: 900, letterSpacing: 1.5, display: 'block', mb: 3}}>
                WHEN THIS ACTION OCCURS
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{mb: hasAttributes ? 2 : 0}}>
                <Box sx={{
                    p: 1.5, bgcolor: 'rgba(16, 185, 129, 0.12)',
                    borderRadius: '16px', display: 'flex', border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                    <Bolt sx={{color: '#10b981', fontSize: '1.8rem'}}/>
                </Box>
                <Typography variant="h5" fontWeight={900} sx={{color: '#fff'}}>
                    {(metadata?.name || `ID: ${actionId}`).toUpperCase()}
                </Typography>
            </Stack>

            {hasAttributes && (
                <>
                    <Divider sx={{borderColor: 'rgba(255,255,255,0.05)', my: 2}}/>
                    <Stack spacing={1}>
                        {metadata.attributes.map(attr => (
                            <Box key={attr.id} sx={{
                                display: 'flex', alignItems: 'center', gap: 2,
                                p: 1.2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.03)'
                            }}>
                                <SettingsInputComponent sx={{fontSize: '1rem', color: '#6366f1'}}/>
                                <Box>
                                    <Typography sx={{
                                        color: '#cbd5e1',
                                        fontSize: '0.85rem',
                                        fontWeight: 700
                                    }}>{attr.name}</Typography>
                                    <Typography sx={{
                                        color: '#64748b',
                                        fontSize: '0.65rem',
                                        fontWeight: 800
                                    }}>{attr.valueType}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                </>
            )}
        </Card>
    );
}