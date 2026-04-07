import React from 'react';
import {Box, IconButton, InputAdornment, Switch, TextField, Typography} from "@mui/material";
import {Abc, CalendarMonth, Numbers} from '@mui/icons-material';
import {DateTimePicker} from '@mui/x-date-pickers';
import {renderTimeViewClock} from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';
import {glassInputStyles} from '@/styles/formStyles';

const IconWithList = ({children, isList}) => (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
        {children}
        {isList && (
            <Typography sx={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#475569',
                fontFamily: 'monospace',
                mt: 0.5
            }}>
                []
            </Typography>
        )}
    </Box>
);

export default function AttributeField({label, vType, value, onChange, endAdornment, isList}) {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        if (vType === 'BOOLEAN' && value === "") {
            onChange("false");
        }
    }, [vType, value, onChange]);

    if (vType === 'BOOLEAN') {
        const isTrue = value === 'true';
        return (
            <TextField
                fullWidth
                label={label}
                value={isTrue ? 'True' : 'False'}
                onClick={() => onChange(isTrue ? 'false' : 'true')}
                sx={{
                    ...glassInputStyles,
                    '& .MuiOutlinedInput-root': {...glassInputStyles['& .MuiOutlinedInput-root'], cursor: 'pointer'}
                }}
                slotProps={{
                    inputLabel: {shrink: true},
                    htmlInput: {readOnly: true},
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconWithList isList={isList}>
                                    <Switch
                                        checked={isTrue}
                                        onChange={(e) => onChange(String(e.target.checked))}
                                        sx={{
                                            ml: -1,
                                            '& .MuiSwitch-switchBase.Mui-checked': {color: '#6366f1'},
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {bgcolor: '#6366f1'}
                                        }}
                                    />
                                </IconWithList>
                            </InputAdornment>
                        ),
                        endAdornment: endAdornment &&
                            <InputAdornment position="end" sx={{mr: 1}}>{endAdornment}</InputAdornment>
                    }
                }}
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
                onChange={(nv) => {
                    if (nv && nv.isValid()) {
                        onChange(nv.toISOString());
                    }
                }}
                ampm={false}
                format="HH:mm DD.MM.YYYY"
                viewRenderers={{hours: renderTimeViewClock, minutes: renderTimeViewClock}}
                enableAccessibleFieldDOMStructure={false}
                slots={{textField: TextField}}
                slotProps={{
                    textField: {
                        fullWidth: true,
                        sx: glassInputStyles,
                        error: value !== "" && value !== null && !dayjs(value).isValid(),
                        InputProps: {
                            startAdornment: (
                                <InputAdornment position="start" sx={{color: '#475569'}}>
                                    <IconWithList isList={isList}>
                                        <CalendarMonth sx={{fontSize: '1.2rem'}}/>
                                    </IconWithList>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end" sx={{mr: 1}}>
                                    <IconButton onClick={() => setOpen(true)} sx={{p: 0.5}}>
                                        <CalendarMonth sx={{color: 'rgba(255,255,255,0.2)'}}/>
                                    </IconButton>
                                    {endAdornment}
                                </InputAdornment>
                            )
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
            placeholder={isList ? "val1, val2, val3..." : ""}
            sx={glassInputStyles}
            onChange={(e) => {
                const val = e.target.value;
                const isNumeric = /^-?\d*\.?\d*$/.test(val);
                if (isList || vType !== 'NUMBER' || val === '' || isNumeric) {
                    onChange(val);
                }
            }}
            slotProps={{
                input: {
                    sx: {
                        fontSize: '1.1rem',
                        fontFamily: (vType === 'NUMBER' && !isList) ? 'monospace' : 'inherit'
                    },
                    startAdornment: (
                        <InputAdornment position="start" sx={{color: '#475569'}}>
                            <IconWithList isList={isList}>
                                {vType === 'NUMBER' ? <Numbers sx={{fontSize: '1.2rem'}}/> :
                                    <Abc sx={{fontSize: '1.6rem'}}/>}
                            </IconWithList>
                        </InputAdornment>
                    ),
                    endAdornment: endAdornment &&
                        <InputAdornment position="end" sx={{mr: 1}}>{endAdornment}</InputAdornment>
                }
            }}
        />
    );
}