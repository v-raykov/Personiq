import React from 'react';
import {
    Box, Typography, Card, IconButton, Stack, Divider, Zoom, Button
} from '@mui/material';
import {
    DeleteOutline, Extension, SettingsInputComponent, HorizontalRule, Add
} from '@mui/icons-material';

export default function DefinitionCard({
                                           index,
                                           data,
                                           icon: IconComponent = Extension,
                                           onAddAttribute,
                                           onDeleteAttribute,
                                           onDeleteDefinition
                                       }) {
    return (
        <Zoom in style={{ transitionDelay: `${index * 30}ms` }}>
            <Card sx={{
                p: 0, height: '380px', borderRadius: '32px',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex', flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    transform: 'translateY(-5px)',
                    borderColor: '#6366f1',
                }
            }}>
                <Box sx={{ p: 3, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{
                            p: 1.5, bgcolor: 'rgba(99, 102, 241, 0.12)',
                            borderRadius: '16px', display: 'flex', border: '1px solid rgba(129, 140, 248, 0.2)'
                        }}>
                            {/* Render the dynamic icon here */}
                            <IconComponent sx={{ color: '#818cf8', fontSize: '1.8rem' }} />
                        </Box>
                        <Typography variant="h5" fontWeight={900} noWrap sx={{ color: '#fff' }}>
                            {data.name.toUpperCase()}
                        </Typography>
                    </Stack>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 2 }} />

                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 900, mb: 1.5, display: 'block', letterSpacing: 1.5 }}>
                        ATTRIBUTES ({data.attributes?.length || 0})
                    </Typography>

                    <Box sx={{
                        flexGrow: 1, overflowY: 'auto', pr: 1,
                        '&::-webkit-scrollbar': { width: '4px' },
                        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }
                    }}>
                        <Stack spacing={1}>
                            {data.attributes?.map(attr => (
                                <Box key={attr.id} sx={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    p: 1.2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.03)'
                                }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <SettingsInputComponent sx={{ fontSize: '0.9rem', color: '#6366f1' }} />
                                        <Box>
                                            <Typography sx={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}>
                                                {attr.name}
                                            </Typography>
                                            <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800 }}>
                                                {attr.valueType || attr.type} {attr.isList ? '[]' : ''}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteAttribute(attr.id);
                                        }}
                                        sx={{ color: '#ef4444', p: 0.5 }}
                                    >
                                        <HorizontalRule sx={{ fontSize: '1rem' }} />
                                    </IconButton>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Box>

                <Box sx={{
                    p: 2,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Button
                        startIcon={<Add />}
                        onClick={() => onAddAttribute(data)}
                        sx={{ color: '#818cf8', fontWeight: 800, borderRadius: '12px' }}
                    >
                        Add Attribute
                    </Button>
                    <IconButton
                        onClick={() => onDeleteDefinition(data.id)}
                        sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' } }}
                    >
                        <DeleteOutline />
                    </IconButton>
                </Box>
            </Card>
        </Zoom>
    );
}