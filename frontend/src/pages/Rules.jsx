import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Fade } from '@mui/material';
import { Add } from '@mui/icons-material';
import Masonry from '@mui/lab/Masonry';
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
            const [rRes, aRes] = await Promise.all([getRules(tenantUri), getActions(tenantUri)]);
            setRules(rRes.data || []);
            setActions(aRes.data || []);
        } catch (err) { console.error(err); }
    }, [tenantUri]);

    useEffect(() => { loadData(); }, [loadData]);

    return (
        <Fade in timeout={800}>
            <Box sx={{ width: '100%', pb: 10, px: 2 }}>
                {/* HEADER: Matched exactly to Actions page */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                    <Box>
                        <Typography variant="h3" fontWeight={900} sx={{ color: '#fff', letterSpacing: -1.5 }}>
                            Rule Library
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#94a3b8', mt: 1, fontWeight: 400 }}>
                            Manage execution logic for {tenantUri}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setIsModalOpen(true)}
                        sx={{
                            borderRadius: '16px', fontWeight: 800, px: 4, py: 2,
                            background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        Create Rule
                    </Button>
                </Box>

                {/* MASONRY: Reverted to the tight "Vacuum Pack" spacing */}
                <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={4}>
                    {rules.map((rule) => (
                        <RuleCard
                            key={rule.id}
                            rule={rule}
                            actions={actions}
                            onDelete={loadData}
                            tenantUri={tenantUri}
                        />
                    ))}
                </Masonry>

                <RuleBuilder open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={loadData} tenantUri={tenantUri} />
            </Box>
        </Fade>
    );
}