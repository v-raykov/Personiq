import React, { useState } from 'react';
import {
    Paper, Typography, Select, MenuItem, Box,
    InputBase, FormControlLabel, Switch, IconButton, Tooltip
} from '@mui/material';
import { DeleteOutline, SyncAlt } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { SUPPORTED_OPERATORS, getInitialValue } from './operators';

const pillInputStyles = {
    '& .MuiInputBase-input': { color: '#fff', fontSize: '0.8rem', p: '4px 8px' },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiSvgIcon-root': { color: '#818cf8', fontSize: '1.1rem' }
};

export default function BuilderPill({
                                        item,
                                        allAttributes,
                                        onDrop,
                                        onDelete,
                                        onUpdate,
                                        draggingId,
                                        setDraggingId
                                    }) {
    const [dropMode, setDropMode] = useState(null);
    const entityColor = item.entity === 'CUSTOMER' ? '#6366f1' : '#10b981';

    // --- LOGIC CHANGE START ---
    // If it's a list, force "contains" and "not contains" only
    const listOps = [
        { value: '~', label: 'contains' },
        { value: '!~', label: 'not contains' }
    ];

    const ops = item.isList
        ? listOps
        : (SUPPORTED_OPERATORS[item.valueType] || SUPPORTED_OPERATORS.STRING);
    // --- LOGIC CHANGE END ---

    const isBoolean = item.valueType === 'BOOLEAN';
    const isNumber = item.valueType === 'NUMBER';
    const isDate = item.valueType === 'DATE';

    const compatibleAttrs = allAttributes.filter(a =>
        a.valueType === item.valueType && a.id !== item.attrId
    );

    const handleNumberChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
            onUpdate(item.id, { val });
        }
    };

    const toggleMode = (e) => {
        e.stopPropagation();
        const newMode = item.valueMode === 'attribute' ? 'literal' : 'attribute';
        onUpdate(item.id, {
            valueMode: newMode,
            val: newMode === 'literal' ? getInitialValue(item.valueType) : ''
        });
    };

    return (
        <Box
            draggable
            onDragStart={(e) => {
                e.stopPropagation();
                setDraggingId(item.id);
                e.dataTransfer.setData("sourceId", item.id);
            }}
            onDragEnd={() => setDraggingId(null)}
            sx={{ opacity: draggingId === item.id ? 0.3 : 1, position: 'relative' }}
        >
            <Typography
                variant="caption"
                sx={{
                    position: 'absolute', top: -10, right: 12, bgcolor: entityColor,
                    zIndex: 5, color: '#fff', px: 0.8, py: 0.2, borderRadius: '4px',
                    fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase'
                }}
            >
                {item.entity}
            </Typography>

            <Paper
                onDragOver={(e) => {
                    if (draggingId === item.id) return;
                    e.preventDefault();
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mid = rect.top + rect.height * 0.4;
                    setDropMode(e.clientY < mid ? 'nest' : 'after');
                }}
                onDragLeave={() => setDropMode(null)}
                onDrop={(e) => {
                    onDrop(e, item.id, dropMode);
                    setDropMode(null);
                }}
                sx={{
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid',
                    borderColor: dropMode === 'nest' ? entityColor : (dropMode === 'after' ? '#fff' : 'rgba(255,255,255,0.08)'),
                    borderRadius: '16px',
                    p: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    minWidth: '580px',
                    transition: 'border-color 0.2s'
                }}
            >
                <Typography sx={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}>
                    {item.attrName}
                </Typography>

                <Select
                    // Default to contains (~) for lists if no operator is stored
                    value={item.operator || (item.isList ? '~' : '=')}
                    onChange={(e) => onUpdate(item.id, { operator: e.target.value })}
                    sx={{
                        height: 32, color: '#818cf8', fontSize: '0.8rem',
                        fontWeight: 700, '& fieldset': { border: 'none' }
                    }}
                >
                    {ops.map(op => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
                </Select>

                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.valueMode === 'attribute' ? (
                        <Select
                            value={item.val || ''}
                            onChange={(e) => onUpdate(item.id, { val: e.target.value })}
                            displayEmpty
                            sx={{
                                flexGrow: 1, height: 32, bgcolor: 'rgba(99, 102, 241, 0.1)',
                                color: '#fff', fontSize: '0.8rem', borderRadius: '4px',
                                '& fieldset': { border: 'none' }
                            }}
                        >
                            <MenuItem value="" disabled>Select Attribute...</MenuItem>
                            {compatibleAttrs.map(a => (
                                <MenuItem key={a.id} value={a.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: a.entity === 'CUSTOMER' ? '#6366f1' : '#10b981' }} />
                                        <Typography sx={{ fontSize: '0.8rem', flexGrow: 1 }}>{a.name}</Typography>
                                        <Typography sx={{ fontSize: '0.6rem', opacity: 0.5 }}>ID: {a.id}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    ) : (
                        <Box sx={{ flexGrow: 1 }}>
                            {isBoolean ? (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={item.val === 'true'}
                                            onChange={(e) => onUpdate(item.id, { val: String(e.target.checked) })}
                                        />
                                    }
                                    label={item.val === 'true' ? 'True' : 'False'}
                                    sx={{ '& .MuiTypography-root': { color: '#fff', fontSize: '0.8rem' } }}
                                />
                            ) : isDate ? (
                                <DateTimePicker
                                    value={dayjs(item.val)}
                                    onChange={(val) => onUpdate(item.id, { val: val ? val.toISOString() : '' })}
                                    ampm={false}
                                    format="HH:mm DD/MM/YYYY"
                                    slotProps={{ textField: { size: 'small', sx: pillInputStyles } }}
                                />
                            ) : (
                                <InputBase
                                    value={item.val}
                                    onChange={isNumber ? handleNumberChange : (e) => onUpdate(item.id, { val: e.target.value })}
                                    placeholder={isNumber ? "0.00" : "Value..."}
                                    sx={{
                                        color: '#fff', fontSize: '0.85rem', bgcolor: 'rgba(0,0,0,0.2)',
                                        px: 1, borderRadius: '4px', width: '100%'
                                    }}
                                />
                            )}
                        </Box>
                    )}

                    <Tooltip title={item.valueMode === 'attribute' ? "Switch to Value" : "Compare with Attribute"}>
                        <IconButton
                            size="small"
                            onClick={toggleMode}
                            sx={{
                                color: item.valueMode === 'attribute' ? '#818cf8' : 'rgba(255,255,255,0.2)',
                                bgcolor: item.valueMode === 'attribute' ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(129, 140, 248, 0.2)' }
                            }}
                        >
                            <SyncAlt fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                <IconButton
                    size="small"
                    onClick={() => onDelete(item.id)}
                    sx={{ color: 'rgba(255,255,255,0.15)', '&:hover': { color: '#ef4444' } }}
                >
                    <DeleteOutline fontSize="small" />
                </IconButton>
            </Paper>
        </Box>
    );
}