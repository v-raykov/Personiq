import React from 'react';
import { Card, IconButton, Stack, Box, Typography, Divider, Zoom } from '@mui/material';
import { DeleteOutline, AccountTree } from '@mui/icons-material';
import { deleteRule } from '../../api';
import LogicTree from './LogicTree';

const RuleCard = ({ rule, actions, onDelete, tenantUri }) => {
    const actionName = actions.find(a => a.id === rule.triggerActionId)?.name || 'RULE';

    return (
        <Zoom in>
            <Card sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                width: 'max-content', // Shrink-wrap to the LogicTree width
                height: 'auto',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <AccountTree sx={{ color: '#818cf8', fontSize: '1.2rem' }} />
                        <Typography variant="subtitle1" fontWeight={900} color="#fff">
                            {actionName.toUpperCase()}
                        </Typography>
                    </Stack>
                    <IconButton onClick={() => deleteRule(tenantUri, rule.id).then(onDelete)} size="small" sx={{ color: '#ef4444' }}>
                        <DeleteOutline fontSize="small" />
                    </IconButton>
                </Stack>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />
                <LogicTree expr={rule.expression || rule.ruleExpression} />
            </Card>
        </Zoom>
    );
};

export default RuleCard;