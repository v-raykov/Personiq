import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Fade } from '@mui/material';
import { Add } from '@mui/icons-material';
import { getRules, getActions } from '../api';
import RuleCard from '../components/rules/RuleCard';
import RuleBuilder from '../components/rules/RuleBuilder';

export default function Rules() {
    const { tenantUri } = useParams();
    const [rules, setRules] = useState([]);
    const [actions, setActions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        if (!tenantUri) return;
        try {
            const [rRes, aRes] = await Promise.all([
                getRules(tenantUri),
                getActions(tenantUri)
            ]);
            setRules(rRes.data || []);
            setActions(aRes.data || []);
        } catch (err) { console.error("Load failed", err); }
    }, [tenantUri]);

    useEffect(() => { loadData(); }, [loadData]);

    return (
        <Fade in timeout={800}>
            <Box sx={{ width: '100%', pb: 10, px: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
                    <Box>
                        <Typography variant="h3" fontWeight={900} sx={{ color: '#fff', letterSpacing: -1.5 }}>Rule Library</Typography>
                        <Typography variant="h6" sx={{ color: '#94a3b8', mt: 1, fontWeight: 400 }}>Logical triggers for {tenantUri}</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setIsModalOpen(true)}
                            sx={{ borderRadius: '16px', fontWeight: 800, px: 4, py: 2, background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)' }}>
                        Create Rule
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'flex-start' }}>
                    {rules.map((rule) => (
                        <RuleCard key={rule.id} rule={rule} actions={actions} onDelete={loadData} tenantUri={tenantUri} />
                    ))}
                </Box>

                <RuleBuilder
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={loadData}
                    tenantUri={tenantUri}
                />
            </Box>
        </Fade>
    );
}