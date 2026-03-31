import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Box, Button, Collapse, Fade, Grid, IconButton, Stack, Typography} from '@mui/material';
import {Add, ArrowBack, KeyboardArrowDown} from '@mui/icons-material';
import Masonry from '@mui/lab/Masonry';
import {getActionById, getReactions, getRules} from '../api';

import ConditionPane from '../components/reactions/trigger/ConditionPane.jsx';
import ActionPane from '../components/reactions/trigger/ActionPane.jsx';
import ReactionCard from '../components/reactions/ReactionCard';
import ReactionBuilder from '../components/reactions/ReactionBuilder';

export default function Reactions() {
    const {tenantUri, ruleId} = useParams();
    const navigate = useNavigate();
    const [reactions, setReactions] = useState([]);
    const [rule, setRule] = useState(null);
    const [actionMetadata, setActionMetadata] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showLogic, setShowLogic] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [reRes, ruRes] = await Promise.all([
                getReactions(tenantUri),
                getRules(tenantUri)
            ]);

            const allReactions = reRes?.data || [];
            const allRules = ruRes?.data || [];

            const currentRule = allRules.find(r => String(r.id) === String(ruleId));

            setReactions(allReactions.filter(r => String(r.ruleId) === String(ruleId)));
            setRule(currentRule);

            if (currentRule?.triggerActionId) {
                const actionRes = await getActionById(tenantUri, currentRule.triggerActionId);
                setActionMetadata(actionRes?.data || null);
            }
        } catch (err) {
            console.error("Failed to load reactions:", err);
            setReactions([]);
        }
    }, [tenantUri, ruleId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <Fade in timeout={800}>
            <Box sx={{width: '100%', pb: 10}}>
                <Button startIcon={<ArrowBack/>} onClick={() => navigate(`/${tenantUri}/rules`)}
                        sx={{color: '#94a3b8', mb: 4, fontWeight: 800}}>
                    BACK TO RULES
                </Button>

                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 4}}>
                    <Typography variant="h3" fontWeight={900}
                                sx={{color: '#fff', letterSpacing: -1.5}}>Reactions</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" onClick={() => setShowLogic(!showLogic)}
                           sx={{cursor: 'pointer', color: '#6366f1'}}>
                        <Typography variant="subtitle2"
                                    fontWeight={800}>{showLogic ? 'HIDE TRIGGER' : 'SHOW TRIGGER'}</Typography>
                        <IconButton size="small" sx={{
                            color: 'inherit',
                            transform: showLogic ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: '0.3s'
                        }}>
                            <KeyboardArrowDown/>
                        </IconButton>
                    </Stack>
                </Box>

                <Collapse in={showLogic}>
                    <Grid container spacing={4} sx={{mb: 6}} alignItems="flex-start">
                        <Grid>
                            <ConditionPane expression={rule?.expression}/>
                        </Grid>
                        <Grid>
                            <ActionPane metadata={actionMetadata} actionId={rule?.triggerActionId}/>
                        </Grid>
                    </Grid>
                </Collapse>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 3}}>
                    <Typography variant="caption" sx={{color: '#94a3b8', fontWeight: 800, letterSpacing: 1.5}}>
                        {reactions.length} ACTIVE {reactions.length === 1 ? 'REACTION' : 'REACTIONS'}
                    </Typography>
                    <Button variant="contained" startIcon={<Add/>} onClick={() => setIsModalOpen(true)} sx={{
                        borderRadius: '12px',
                        fontWeight: 800,
                        px: 4,
                        py: 1.5,
                        background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)'
                    }}>
                        ADD REACTION
                    </Button>
                </Stack>

                <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={3}>
                    {reactions?.map((re) => (
                        <ReactionCard
                            key={re.id}
                            rule={rule}
                            reaction={re}
                            onDelete={loadData}
                        />
                    ))}
                </Masonry>

                <ReactionBuilder
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={loadData}
                    fixedRuleId={ruleId}
                    tenantUri={tenantUri}
                    ruleActionUri={rule?.triggerActionId}
                />
            </Box>
        </Fade>
    );
}