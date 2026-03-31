import React from 'react';
import {IconButton, InputAdornment, Switch, TextField} from "@mui/material";
import {Abc, CalendarMonth, Numbers} from '@mui/icons-material';
import {DateTimePicker} from '@mui/x-date-pickers';
import {renderTimeViewClock} from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';

const fieldStyles = {
    '& .MuiOutlinedInput-root': {
        height: 64,
        borderRadius: '16px',
        bgcolor: 'rgba(255,255,255,0.03)',
        color: '#fff',
        '& fieldset': {border: '1px solid rgba(255,255,255,0.1)'},
        '&:hover fieldset': {borderColor: 'rgba(255,255,255,0.25)', bgcolor: 'rgba(255,255,255,0.05)'},
        '&.Mui-focused fieldset': {border: '1px solid #6366f1'},
    },
    '& .MuiInputLabel-root': {
        color: '#94a3b8',
        fontSize: '1.1rem',
        '&.Mui-focused': {color: '#6366f1'},
        '&.MuiInputLabel-shrink': {transform: 'translate(14px, -9px) scale(0.75)'}
    }
};

export default function AttributeField({label, vType, value, onChange, endAdornment}) {
    const [open, setOpen] = React.useState(false);
    if (vType === 'BOOLEAN') {
        return (
            <TextField
                fullWidth
                label={label}
                value={value === 'true' ? 'True' : 'False'}
                InputLabelProps={{shrink: true}}
                sx={{
                    ...fieldStyles,
                    '& .MuiOutlinedInput-root': {...fieldStyles['& .MuiOutlinedInput-root'], cursor: 'pointer'}
                }}
                InputProps={{
                    readOnly: true,
                    startAdornment: (
                        <InputAdornment position="start">
                            <Switch
                                checked={value === 'true'}
                                onChange={(e) => onChange(String(e.target.checked))}
                                sx={{
                                    ml: -1,
                                    '& .MuiSwitch-switchBase.Mui-checked': {color: '#6366f1'},
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {bgcolor: '#6366f1'}
                                }}
                            />
                        </InputAdornment>
                    ),
                    endAdornment: endAdornment &&
                        <InputAdornment position="end" sx={{mr: 1}}>{endAdornment}</InputAdornment>
                }}
                onClick={() => onChange(value === 'true' ? 'false' : 'true')}
                onFocus={(e) => e.target.blur()}
            />
        );
    }

    if (vType === 'DATE') {
        return (
            <DateTimePicker
                label={label}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                value={value ? dayjs(value) : null}
                onChange={(nv) => onChange(nv && nv.isValid() ? nv.toISOString() : null)}
                ampm={false}
                format="HH:mm DD.MM.YYYY"
                viewRenderers={{hours: renderTimeViewClock, minutes: renderTimeViewClock}}
                slotProps={{
                    textField: {
                        fullWidth: true,
                        sx: fieldStyles,
                        InputProps: {
                            endAdornment: (
                                <InputAdornment position="end" sx={{mr: 1}}>
                                    <IconButton onClick={() => setOpen(true)} sx={{p: 0.5}}>
                                        <CalendarMonth sx={{color: '#818cf8'}}/>
                                    </IconButton>
                                    {endAdornment}
                                </InputAdornment>
                            ),
                        }
                    },
                    field: {shouldRespectLeadingZeros: true},
                    desktopPaper: {
                        sx: {
                            bgcolor: '#1e293b',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            '& .MuiTypography-root': {color: '#fff'},
                            '& .MuiPickersDay-root': {color: '#fff'},
                            '& .MuiPickersDay-root.Mui-selected': {bgcolor: '#6366f1 !important'},
                            '& .MuiClock-pin': {bgcolor: '#6366f1'},
                            '& .MuiClockPointer-root': {bgcolor: '#6366f1'},
                            '& .MuiClockPointer-thumb': {bgcolor: '#6366f1', border: '16px solid #6366f1'},
                            '& .MuiClockNumber-root': {color: '#fff'},
                            '& .MuiButtonBase-root': {color: '#818cf8'}
                        }
                    }
                }}
            />
        );
    }

    return (
        <TextField
            fullWidth
            label={label}
            value={value}
            onChange={(e) => {
                const val = e.target.value;
                if (vType !== 'NUMBER' || val === '' || /^-?\d*\.?\d*$/.test(val)) {
                    onChange(val);
                }
            }}
            sx={fieldStyles}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start" sx={{color: '#475569', opacity: 0.6}}>
                        {vType === 'NUMBER' ? <Numbers/> : <Abc sx={{fontSize: '1.5rem'}}/>}
                    </InputAdornment>
                ),
                endAdornment: endAdornment &&
                    <InputAdornment position="end" sx={{mr: 1}}>{endAdornment}</InputAdornment>,
                sx: {fontSize: '1.1rem', fontFamily: vType === 'NUMBER' ? 'monospace' : 'inherit'}
            }}
        />
    );
}