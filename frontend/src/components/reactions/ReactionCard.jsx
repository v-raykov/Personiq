import React from 'react';
import {
    Card, CardContent, Typography, Box, Divider,
    Stack, IconButton, Tooltip
} from '@mui/material';
import {
    DeleteOutline,
    ArrowForwardIos,
    Inventory2Outlined,
    EditAttributesOutlined,
    SettingsInputComponentOutlined,
    TouchApp
} from '@mui/icons-material';

const ReactionCard = ({ rule, reactions, onDelete }) => {

    const handleDelete = async (reactionId) => {
        if (window.confirm("Are you sure you want to remove this reaction?")) {
            console.log("Deleting reaction:", reactionId);
        }
    };

    return (
        <Card sx={{
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-5px)',
                borderColor: 'primary.main',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
            }
        }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                    <SettingsInputComponentOutlined sx={{ color: 'primary.main', fontSize: '2rem' }} />
                    <Box>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>
                            Triggered By Rule
                        </Typography>
                        <Typography variant="h5" fontWeight={900} sx={{ color: '#fff', lineHeight: 1.2 }}>
                            {rule?.name || `Rule #${reactions[0]?.ruleId}`}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3, opacity: 0.1, borderStyle: 'dashed' }} />

                <Stack spacing={2}>
                    {reactions.map((re, index) => {
                        const isItem = Boolean(re.templateItemId);

                        return (
                            <Box key={re.id || index} sx={{
                                position: 'relative',
                                p: 2,
                                bgcolor: 'rgba(255,255,255,0.04)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                '&:hover .delete-btn': { opacity: 1 }
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 44,
                                    height: 44,
                                    borderRadius: '10px',
                                    bgcolor: isItem ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                    color: isItem ? '#f59e0b' : '#6366f1'
                                }}>
                                    {isItem ? <Inventory2Outlined /> : <EditAttributesOutlined />}
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {isItem ? 'Grant Item' : 'Update Attribute'}
                                        <ArrowForwardIos sx={{ fontSize: 10, opacity: 0.5 }} />
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: '#94a3b8', fontFamily: 'monospace', mt: 0.5 }}>
                                        {isItem ? (
                                            `Template: ${re.templateItemId}`
                                        ) : (
                                            <>
                                                <Box component="span" sx={{ color: '#818cf8' }}>{re.operation}</Box>
                                                {` on ID: ${re.attributeId}`}
                                                {re.value && (
                                                    <Box component="span" sx={{ color: '#10b981' }}>
                                                        {` → ${re.isValueAttributeId ? 'ATTR:' : ''}${re.value}`}
                                                    </Box>
                                                )}
                                            </>
                                        )}
                                    </Typography>
                                </Box>

                                <Tooltip title="Remove Reaction">
                                    <IconButton
                                        className="delete-btn"
                                        size="small"
                                        onClick={() => handleDelete(re.id)}
                                        sx={{
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            color: '#ef4444',
                                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                                        }}
                                    >
                                        <DeleteOutline fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        );
                    })}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default ReactionCard;