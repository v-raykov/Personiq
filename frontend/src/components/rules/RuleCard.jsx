import React from 'react';
import {Box, Card, Divider, IconButton, Stack, Typography, Zoom} from '@mui/material';
import {AccountTree, ArrowForward, DeleteOutline} from '@mui/icons-material';
import {deleteRule} from '@/api';
import LogicTree from './LogicTree';
import {useNavigate} from "react-router-dom";

const RuleCard = ({rule, actions, onDelete, tenantUri}) => {
    const navigate = useNavigate();
    const actionName = actions.find(a => a.id === rule.triggerActionId)?.name || 'RULE';

    const handleDelete = async (e) => {
        e.stopPropagation();
        try {
            await deleteRule(tenantUri, rule.id);
            onDelete();
        } catch (err) {
            console.error("Failed to delete rule:", err);
        }
    };

    return (
        <Zoom in>
            <Card
                onClick={() => navigate(`/${tenantUri}/rules/${rule.id}/reactions`)}
                sx={{
                    p: 2.5,
                    borderRadius: '24px',
                    bgcolor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    width: 'fit-content',
                    minWidth: '280px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        bgcolor: 'rgba(30, 41, 59, 0.8)',
                        borderColor: '#6366f1',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(99, 102, 241, 0.2)',
                        '& .view-indicator': {opacity: 1, transform: 'translateX(0)'}
                    },
                    '&:active': {transform: 'translateY(-2px) scale(0.98)'}
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 2}}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{
                            p: 1, borderRadius: '10px',
                            bgcolor: 'rgba(99, 102, 241, 0.15)',
                            display: 'flex'
                        }}>
                            <AccountTree sx={{color: '#818cf8', fontSize: '1.1rem'}}/>
                        </Box>
                        <Typography variant="subtitle1" fontWeight={900} color="#fff" sx={{letterSpacing: 0.5}}>
                            {actionName.toUpperCase()}
                        </Typography>
                    </Stack>

                    <IconButton
                        onClick={handleDelete}
                        size="small"
                        sx={{
                            color: '#64748b',
                            '&:hover': {color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)'}
                        }}
                    >
                        <DeleteOutline fontSize="small"/>
                    </IconButton>
                </Stack>

                <Divider sx={{borderColor: 'rgba(255,255,255,0.06)', mb: 2}}/>

                <Box sx={{pointerEvents: 'none'}}>
                    <LogicTree expr={rule.expression || rule.ruleExpression}/>
                </Box>

                <Stack
                    className="view-indicator"
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{
                        position: 'absolute', bottom: 16, right: 20,
                        opacity: 0, transform: 'translateX(-10px)',
                        transition: 'all 0.3s ease',
                        color: '#818cf8'
                    }}
                >
                    <Typography variant="caption" fontWeight={900}>SHOW REACTIONS</Typography>
                    <ArrowForward sx={{fontSize: '0.9rem'}}/>
                </Stack>
            </Card>
        </Zoom>
    );
};

export default RuleCard;