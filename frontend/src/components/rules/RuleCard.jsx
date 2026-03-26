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
                p: 4, borderRadius: '32px', bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative',
                display: 'inline-flex', flexDirection: 'column', minWidth: '280px', maxWidth: 'max-content'
            }}>
                <IconButton
                    onClick={() => window.confirm("Delete rule?") && deleteRule(tenantUri, rule.id).then(onDelete)}
                    sx={{ position: 'absolute', top: 20, right: 20, color: '#ef4444' }}
                >
                    <DeleteOutline fontSize="small" />
                </IconButton>

                <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3, pr: 6 }}>
                    <Box sx={{ p: 1.8, bgcolor: 'rgba(99, 102, 241, 0.12)', borderRadius: '18px' }}>
                        <AccountTree sx={{ color: '#818cf8', fontSize: '2rem' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={900} sx={{ color: '#fff' }}>
                        {actionName.toUpperCase()}
                    </Typography>
                </Stack>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 3 }} />

                {/* USE THE LOGIC TREE HERE */}
                <LogicTree expr={rule.expression || rule.ruleExpression} />
            </Card>
        </Zoom>
    );
};

export default RuleCard;