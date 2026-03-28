import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import dayjs from 'dayjs';

const LogicTree = ({ expr, isFirst = true }) => {
    if (!expr) return null;
    const trimmed = expr.trim();

    // 1. Group Logic (AND/OR)
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        const inner = trimmed.slice(1, -1);
        let braceDepth = 0;
        let splitIdx = -1;
        let operator = 'AND';

        for (let i = 0; i < inner.length; i++) {
            if (inner[i] === '(') braceDepth++;
            else if (inner[i] === ')') braceDepth--;
            if (braceDepth === 0) {
                if (inner[i] === '|') { splitIdx = i; operator = 'OR'; break; }
                if (inner[i] === '&') { splitIdx = i; operator = 'AND'; }
            }
        }

        if (splitIdx !== -1) {
            const left = inner.substring(0, splitIdx);
            const right = inner.substring(splitIdx + 1);
            const children = [left, right];
            const themeColor = operator === 'OR' ? '#f59e0b' : '#6366f1';

            return (
                <Box sx={{
                    position: 'relative',
                    // Global shift to the right so the first vertical line is visible
                    ml: isFirst ? 2 : 0,
                    pl: '48px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* The Operator Tag - Matches absolute positioning from image_4ac9c2.png */}
                    <Box sx={{
                        position: 'absolute',
                        left: -14,
                        top: 0,
                        zIndex: 10,
                        bgcolor: themeColor,
                        color: '#fff',
                        px: 1,
                        py: 0.3,
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}>
                        {operator}
                    </Box>

                    {children.map((child, i) => (
                        <Box key={i} sx={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            // VERTICAL LINE: Adjusted top to 0 so it connects to the tag above
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: -48,
                                width: '2px',
                                bgcolor: themeColor,
                                opacity: 0.4,
                                top: 0,
                                bottom: i === children.length - 1 ? '50%' : 0
                            },
                            // HORIZONTAL BRANCH
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                left: -48,
                                top: '50%',
                                width: '48px',
                                height: '2px',
                                bgcolor: themeColor,
                                opacity: 0.4
                            }
                        }}>
                            <Box sx={{ py: 1.5, width: '100%' }}>
                                <LogicTree expr={child} isFirst={false} />
                            </Box>
                        </Box>
                    ))}
                </Box>
            );
        }
    }

    // 2. Condition Row (Pills)
    const match = trimmed.match(/^([^.]+)\.(.+)\.\d+\s*(=|>|<|!=|~|!~)\s*(.*)$/);
    if (!match) return <Typography sx={{ color: '#64748b' }}>{trimmed}</Typography>;

    const [_, entity, attrName, operator, rawValue] = match;

    const renderPill = (ent, name, isValue = false) => {
        const color = ent.toUpperCase() === 'CUSTOMER' ? '#6366f1' : '#10b981';
        let displayValue = name;

        // Date Format: 13:48 28.03.2026
        if (isValue && /^\d{4}-\d{2}-\d{2}T/.test(name)) {
            displayValue = dayjs(name).format('HH:mm DD.MM.YYYY');
        }

        return (
            <Box sx={{
                bgcolor: isValue ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', px: 1.8, py: 0.5, position: 'relative',
                display: 'inline-flex', alignItems: 'center', minHeight: '32px'
            }}>
                {!isValue && (
                    <Typography variant="caption" sx={{
                        position: 'absolute', top: -8, right: 8, bgcolor: color,
                        color: '#fff', px: 0.7, py: 0.1, borderRadius: '3px',
                        fontSize: '0.55rem', fontWeight: 900
                    }}>
                        {ent}
                    </Typography>
                )}
                <Typography sx={{ color: isValue ? '#fff' : '#cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}>
                    {displayValue}
                </Typography>
            </Box>
        );
    };

    const valueAttrMatch = rawValue.match(/^([^.]+)\.(.+)\.\d+$/);
    const opMap = { '=': 'is', '!=': 'is not', '~': 'contains', '!~': 'not contains' };

    return (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ ml: isFirst ? 6 : 0 }}>
            {renderPill(entity, attrName)}
            <Typography sx={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: 900, fontStyle: 'italic' }}>
                {opMap[operator] || operator}
            </Typography>
            {valueAttrMatch ? renderPill(valueAttrMatch[1], valueAttrMatch[2]) : renderPill('', rawValue, true)}
        </Stack>
    );
};

export default LogicTree;