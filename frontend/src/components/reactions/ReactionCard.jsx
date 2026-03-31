import React from 'react';
import {Box, Card, CardContent, IconButton, Stack, Tooltip, Typography} from '@mui/material';
import {ArrowForwardIos, DeleteOutline, EditAttributesOutlined, Inventory2Outlined} from '@mui/icons-material';

const ReactionCard = ({reaction, customerAttrs = [], onDelete}) => {
    if (!reaction) return null;

    const isItem = Boolean(reaction.templateItemId);

    const attr = customerAttrs.find(a => String(a.id) === String(reaction.attributeId));
    const displayName = attr?.name || reaction.attributeId;

    return (
        <Card sx={{
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            '&:hover': {borderColor: isItem ? '#f59e0b' : '#6366f1'}
        }}>
            <CardContent sx={{p: 3}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 40, height: 40, borderRadius: '10px',
                            bgcolor: isItem ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                            color: isItem ? '#f59e0b' : '#6366f1'
                        }}>
                            {isItem ? <Inventory2Outlined/> : <EditAttributesOutlined/>}
                        </Box>
                        <Typography variant="h6" fontWeight={900} color="white">
                            {isItem ? 'Grant Item' : 'Update Attribute'}
                        </Typography>
                    </Stack>

                    <Tooltip title="Remove">
                        <IconButton onClick={() => onDelete(reaction.id)} sx={{color: '#ef4444'}}>
                            <DeleteOutline fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Box sx={{p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px'}}>
                    <Typography variant="body2" sx={{color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1}}>
                        {isItem ? (
                            <>
                                <Box component="span" sx={{color: '#f59e0b', fontWeight: 800}}>Template:</Box>
                                {reaction.templateItemId}
                            </>
                        ) : (
                            <>
                                <Box component="span" sx={{color: '#818cf8', fontWeight: 800}}>{displayName}</Box>
                                <ArrowForwardIos sx={{fontSize: 10, opacity: 0.3}}/>
                                <Box component="span" sx={{color: '#94a3b8'}}>{reaction.operation}</Box>
                                {reaction.value && (
                                    <>
                                        <ArrowForwardIos sx={{fontSize: 10, opacity: 0.3}}/>
                                        <Box component="span" sx={{color: '#10b981', fontWeight: 700}}>
                                            {reaction.isValueAttributeId ? `ATTR:${reaction.value}` : reaction.value}
                                        </Box>
                                    </>
                                )}
                            </>
                        )}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ReactionCard;