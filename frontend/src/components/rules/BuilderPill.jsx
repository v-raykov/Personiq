import React, { useState } from 'react';
import { Paper, Typography, Select, MenuItem, Box, InputBase, FormControlLabel, Switch, IconButton, InputAdornment } from '@mui/material';
import { DeleteOutline, Numbers } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { SUPPORTED_OPERATORS } from './operators';

const pillInputStyles = {
    '& .MuiInputBase-input': { color: '#fff', fontSize: '0.8rem', p: '4px 8px' },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiSvgIcon-root': { color: '#818cf8', fontSize: '1.1rem' }
};

export default function BuilderPill({ item, onDrop, onDelete, onUpdate, draggingId, setDraggingId }) {
    const [dropMode, setDropMode] = useState(null);
    const entityColor = item.entity === 'CUSTOMER' ? '#6366f1' : '#10b981';
    const isBeingDragged = draggingId === item.id;

    const ops = SUPPORTED_OPERATORS[item.valueType] || SUPPORTED_OPERATORS.STRING;
    const isBoolean = item.valueType === 'BOOLEAN';
    const isNumber = item.valueType === 'NUMBER';

    const handleNumberChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
            onUpdate(item.id, { val });
        }
    };

    return (
        <Box
            draggable
            onDragStart={(e) => { e.stopPropagation(); setDraggingId(item.id); e.dataTransfer.setData("sourceId", item.id); }}
            onDragEnd={() => setDraggingId(null)}
            sx={{ opacity: isBeingDragged ? 0.3 : 1, position: 'relative' }}
        >
            <Typography variant="caption" sx={{ position: 'absolute', top: -10, right: 12, bgcolor: entityColor, zIndex: 5, color: '#fff', px: 0.8, py: 0.2, borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase' }}>
                {item.entity}
            </Typography>

            <Paper
                onDragOver={(e) => {
                    if (isBeingDragged) return;
                    e.preventDefault(); e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropMode((e.clientY - rect.top) < rect.height * 0.4 ? 'nest' : 'after');
                }}
                onDragLeave={() => setDropMode(null)}
                onDrop={(e) => { onDrop(e, item.id, dropMode); setDropMode(null); }}
                sx={{
                    bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid',
                    borderColor: dropMode === 'nest' ? entityColor : (dropMode === 'after' ? '#fff' : 'rgba(255,255,255,0.08)'),
                    borderRadius: '16px', p: '8px 16px', display: 'flex', alignItems: 'center', gap: 2, minWidth: '480px'
                }}
            >
                <Typography sx={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}>{item.attrName}</Typography>

                {!isBoolean ? (
                    <Select
                        value={item.operator || '='}
                        onChange={(e) => onUpdate(item.id, { operator: e.target.value })}
                        sx={{ height: 32, color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, '& fieldset': { border: 'none' } }}
                    >
                        {ops.map(op => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
                    </Select>
                ) : (
                    <Typography sx={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, mx: 1 }}>is</Typography>
                )}

                <Box sx={{ flexGrow: 1 }}>
                    {isBoolean ? (
                        <FormControlLabel
                            control={<Switch size="small" checked={item.val === 'true'} onChange={(e) => onUpdate(item.id, { val: String(e.target.checked), operator: '=' })} />}
                            label={item.val === 'true' ? 'True' : 'False'}
                            sx={{ '& .MuiTypography-root': { color: '#fff', fontSize: '0.8rem', fontWeight: 600 } }}
                        />
                    ) : item.valueType === 'DATE' ? (
                        <DateTimePicker
                            value={dayjs(item.val)}
                            onChange={(val) => onUpdate(item.id, { val: val.toISOString() })}
                            ampm={false} format="HH:mm DD.MM.YYYY"
                            slotProps={{ textField: { size: 'small', sx: pillInputStyles } }}
                        />
                    ) : (
                        <InputBase
                            value={item.val}
                            onChange={isNumber ? handleNumberChange : (e) => onUpdate(item.id, { val: e.target.value })}
                            placeholder={isNumber ? "0.00" : "Value..."}
                            startAdornment={isNumber && (
                                <InputAdornment position="start">
                                    <Numbers sx={{ color: 'rgba(129, 140, 248, 0.3)', fontSize: '0.9rem' }} />
                                </InputAdornment>
                            )}
                            sx={{
                                color: '#fff', fontSize: '0.85rem', bgcolor: 'rgba(0,0,0,0.2)', px: 1, borderRadius: '4px', width: '100%',
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                                '& input[type=number]': { MozAppearance: 'textfield' }
                            }}
                        />
                    )}
                </Box>

                <IconButton size="small" onClick={() => onDelete(item.id)} sx={{ color: 'rgba(255,255,255,0.15)', '&:hover': { color: '#ef4444' } }}>
                    <DeleteOutline fontSize="small" />
                </IconButton>
            </Paper>
        </Box>
    );
}