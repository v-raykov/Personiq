import React from 'react';
import {Box, Card, CardContent, Divider, IconButton, Stack, Typography} from '@mui/material';
import {
    AccessTime,
    ArrowForwardIos,
    DeleteOutline,
    EditAttributesOutlined,
    Inventory2Outlined,
    LabelOutlined,
    ToggleOnOutlined
} from '@mui/icons-material';
import dayjs from 'dayjs';

export default function ReactionCard({reaction, itemData, customerAttrs = [], onDelete}) {
    if (!reaction) return null;
    const isItem = Object.hasOwn(reaction, 'templateItemId');

    const getValDisplay = (attr) => {
        const val = attr.values?.[0];
        if (val === null || val === undefined || val === '') return '—';

        switch (attr.valueType) {
            case 'DATE':
                return {
                    text: dayjs(val).format('DD MMM YYYY, HH:mm'),
                    icon: <AccessTime sx={{fontSize: 14, mr: 0.5, color: '#a855f7'}}/>,
                    color: '#f8fafc'
                };
            case 'BOOLEAN':
                const isTrue = String(val).toLowerCase() === 'true';
                return {
                    text: isTrue ? 'ENABLED' : 'DISABLED',
                    icon: <ToggleOnOutlined sx={{fontSize: 14, mr: 0.5, color: isTrue ? '#10b981' : '#ef4444'}}/>,
                    color: isTrue ? '#10b981' : '#ef4444'
                };
            default:
                return {text: String(val), icon: null, color: '#f8fafc'};
        }
    };

    const attr = customerAttrs.find(a => String(a.id) === String(reaction.attributeId));

    return (
        <Card sx={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'visible',
            '&:hover': {
                transform: 'translateY(-5px)',
                borderColor: isItem ? 'rgba(245, 158, 11, 0.5)' : 'rgba(99, 102, 241, 0.5)',
                boxShadow: `0 12px 40px -12px ${isItem ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
            }
        }}>
            <CardContent sx={{p: 3}}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{
                            width: 48, height: 48, borderRadius: '14px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: isItem
                                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)',
                            color: isItem ? '#f59e0b' : '#818cf8',
                            border: `1px solid ${isItem ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                        }}>
                            {isItem ? <Inventory2Outlined/> : <EditAttributesOutlined/>}
                        </Box>
                        <Box>
                            <Typography variant="overline" sx={{
                                color: '#64748b',
                                fontWeight: 800,
                                letterSpacing: 1.2,
                                display: 'block',
                                lineHeight: 1
                            }}>
                                {isItem ? 'GRANT ITEM' : 'UPDATE ATTR'}
                            </Typography>
                            <Typography variant="h6" fontWeight={900} sx={{color: '#fff', mt: 0.5}}>
                                {isItem ? (itemData?.name || `Instance #${itemData?.id || reaction.templateItemId}`) : (attr?.name || 'Unknown')}
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton
                        onClick={() => onDelete(reaction.id)}
                        sx={{
                            color: '#475569',
                            '&:hover': {color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)'},
                            transition: '0.2s'
                        }}
                    >
                        <DeleteOutline fontSize="small"/>
                    </IconButton>
                </Stack>

                <Box sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '16px',
                    p: 2,
                    border: '1px solid rgba(255, 255, 255, 0.03)'
                }}>
                    {isItem ? (
                        <Stack spacing={2}>
                            {itemData?.attributes?.map((attrObj) => {
                                const display = getValDisplay(attrObj);
                                return (
                                    <Box key={attrObj.attributeId}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <LabelOutlined sx={{fontSize: 12, color: '#94a3b8', opacity: 0.5}}/>
                                                <Typography variant="caption" sx={{
                                                    color: '#94a3b8',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.65rem'
                                                }}>
                                                    {attrObj.name}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" alignItems="center">
                                                {display.icon}
                                                <Typography variant="body2"
                                                            sx={{color: display.color, fontWeight: 700}}>
                                                    {display.text}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        <Divider sx={{mt: 1, borderColor: 'rgba(255,255,255,0.05)'}}/>
                                    </Box>
                                );
                            })}
                        </Stack>
                    ) : (
                        <Stack direction="row" alignItems="center" justifyContent="space-between" py={1} px={1}>
                            <Typography variant="caption" sx={{color: '#94a3b8', fontWeight: 800}}>
                                {reaction.operation}
                            </Typography>

                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <ArrowForwardIos sx={{fontSize: 12, color: '#334155'}}/>
                                <Typography variant="h6" sx={{color: '#10b981', fontWeight: 900}}>
                                    {reaction.isValueAttributeId ? `ATTR:${reaction.value}` : reaction.value}
                                </Typography>
                            </Box>
                        </Stack>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}