import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {Box, Button, Fade, Typography} from '@mui/material';
import {Add} from '@mui/icons-material';
import RuleCard from '@/components/rules/RuleCard.jsx';
import RuleBuilder from '@/components/rules/RuleBuilder.jsx';
import {useRules} from '@/hooks/useRules.js';

export default function Rules() {
    const {tenantUri} = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        rules,
        actions,
        LoadData
    } = useRules(tenantUri);

    return (
        <Fade in timeout={800}>
            <Box sx={{width: '100%', pb: 10, px: 2}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6}}>
                    <Box>
                        <Typography variant="h3" fontWeight={900} sx={{color: '#fff', letterSpacing: -1.5}}>
                            Rule Library
                        </Typography>
                        <Typography variant="h6" sx={{color: '#94a3b8', mt: 1, fontWeight: 400}}>
                            Manage execution logic for {tenantUri}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add/>}
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

                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        alignItems: 'flex-start'
                    }}>
                    {rules.map((rule) => (
                        <RuleCard
                            key={rule.id}
                            rule={rule}
                            actions={actions}
                            onDelete={() => {
                                void LoadData();
                            }}
                            tenantUri={tenantUri}
                        />
                    ))}
                </Box>

                <RuleBuilder
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => {
                        void LoadData();
                    }}
                    tenantUri={tenantUri}
                />
            </Box>
        </Fade>
    );
}