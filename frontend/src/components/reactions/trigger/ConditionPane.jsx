import React from 'react';
import {Box, Typography} from '@mui/material';
import LogicTree from '../../rules/LogicTree';

export default function ConditionPane({expression}) {
    return (
        <Box sx={{
            p: 4, height: '100%', minHeight: '180px', borderRadius: '32px',
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex', flexDirection: 'column'
        }}>
            <Typography variant="caption"
                        sx={{color: '#6366f1', fontWeight: 900, letterSpacing: 1.5, display: 'block', mb: 3}}>
                IF THESE CONDITIONS ARE MET
            </Typography>
            <Box sx={{flexGrow: 1, display: 'flex', alignItems: 'center'}}>
                {expression ? <LogicTree expr={expression}/> :
                    <Typography sx={{color: '#64748b'}}>No logic defined.</Typography>}
            </Box>
        </Box>
    );
}