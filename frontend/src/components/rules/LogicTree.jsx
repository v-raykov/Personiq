import React from 'react';
import { Box, Typography } from '@mui/material';

const LogicTree = ({ expr }) => {
    if (!expr) return null;
    const trimmed = expr.trim();

    // 1. Handle Grouped Logic (Nested Parentheses)
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        const inner = trimmed.slice(1, -1);
        const isOr = inner.includes(' OR ');
        const parts = inner.split(isOr ? ' OR ' : ' AND ');
        const themeColor = isOr ? '#f59e0b' : '#6366f1'; // Orange for OR, Indigo for AND

        return (
            <Box sx={{ position: 'relative', pl: 5, display: 'inline-flex', flexDirection: 'column', width: 'max-content' }}>
                {/* The Vertical Line for the branch */}
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: '24px', width: '2px', bgcolor: themeColor, opacity: 0.4 }} />

                {/* The Label (AND/OR) */}
                <Box sx={{
                    position: 'absolute', left: -14, top: -10, zIndex: 2,
                    bgcolor: themeColor, color: '#fff', px: 1, py: 0.3, borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900
                }}>
                    {isOr ? 'OR' : 'AND'}
                </Box>

                {parts.map((p, i) => (
                    <Box key={i} sx={{ position: 'relative', display: 'flex', alignItems: 'center', minHeight: '48px' }}>
                        {/* The Horizontal Line connecting to the pill */}
                        <Box sx={{ position: 'absolute', left: -40, top: '50%', width: '40px', height: '2px', bgcolor: themeColor, opacity: 0.4 }} />
                        <LogicTree expr={p} />
                    </Box>
                ))}
            </Box>
        );
    }

    // 2. Handle Leaf Nodes (Individual Condition Pills)
    // Matches: ENTITY.attributeName = value
    const match = trimmed.match(/([A-Z_]+)\.([\w\s]+)\.?\d*\s*(=|>|<|!=)\s*(.*)/);

    if (!match) {
        return <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>{trimmed}</Typography>;
    }

    const [_, entity, attrName, operator, value] = match;
    const entityColor = entity === 'CUSTOMER' ? '#6366f1' : '#10b981';

    return (
        <Box sx={{
            bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', p: '10px 16px', position: 'relative',
            display: 'inline-flex', alignItems: 'center', gap: 1.5, my: 0.8, ml: 1,
            whiteSpace: 'nowrap'
        }}>
            <Typography variant="caption" sx={{
                position: 'absolute', top: -9, right: 8, bgcolor: entityColor,
                color: '#fff', px: 0.8, py: 0.2, borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900
            }}>
                {entity}
            </Typography>
            <Typography sx={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}>{attrName}</Typography>
            <Typography sx={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, fontStyle: 'italic' }}>is</Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{value}</Typography>
        </Box>
    );
};

export default LogicTree;