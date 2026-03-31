import React from 'react';
import {
    Autocomplete,
    Box,
    Fade,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import {SyncAlt} from '@mui/icons-material';
import AttributeField from './AttributeField.jsx';
import dayjs from 'dayjs';

const NO_VALUE_OPS = ["INCREMENT", "DECREMENT", "SET_FALSE", "SET_TRUE", "FLIP", "SET_NOW", "CLEAR"];

const inputStyles = {
    '& .MuiOutlinedInput-root': {
        height: 64,
        borderRadius: '16px',
        bgcolor: 'rgba(255,255,255,0.03)',
        color: '#fff',
        '& fieldset': {border: '1px solid rgba(255,255,255,0.1)'},
        '&:hover fieldset': {borderColor: 'rgba(255,255,255,0.25)', bgcolor: 'rgba(255,255,255,0.05)'},
        '&.Mui-focused fieldset': {border: '1px solid #6366f1'}
    },
    '& .MuiInputLabel-root': {
        color: '#94a3b8',
        fontSize: '1.1rem',
        '&.Mui-focused': {color: '#6366f1'},
        '&.MuiInputLabel-shrink': {transform: 'translate(14px, -9px) scale(0.75)'}
    }
};

export default function AttributeUpdateForm({
                                                customerAttrs,
                                                targetAttr,
                                                setTargetAttr,
                                                operation,
                                                setOperation,
                                                value,
                                                setValue,
                                                isLinked,
                                                setIsLinked,
                                                availableLinks,
                                                filteredOperations
                                            }) {
    const cleanAvailableLinks = availableLinks.filter(link =>
        !(link.entity === 'CUSTOMER' && link.id === targetAttr?.id)
    );

    const handleAttributeChange = (v) => {
        setTargetAttr(v);
        setOperation('SET');
        setIsLinked(false);
        if (v?.valueType === 'BOOLEAN') setValue('false');
        else if (v?.valueType === 'DATE') setValue(dayjs().toISOString());
        else setValue('');
    };

    const toggleModeButton = (
        <Tooltip title={isLinked ? "Switch to Manual Value" : "Link to Attribute"}>
            <IconButton
                onClick={(e) => {
                    e.stopPropagation();
                    setIsLinked(!isLinked);
                    setValue('');
                }}
                sx={{color: isLinked ? '#6366f1' : '#475569'}}
            >
                <SyncAlt/>
            </IconButton>
        </Tooltip>
    );

    return (
        <Stack spacing={3}>
            <Autocomplete
                options={customerAttrs}
                getOptionLabel={(option) => option.name || ""}
                value={targetAttr || null}
                disableClearable
                onChange={(e, v) => handleAttributeChange(v)}
                renderInput={(params) => (
                    <TextField {...params} label="Select Target Attribute" required sx={inputStyles}
                               inputProps={{...params.inputProps, readOnly: true}}/>
                )}
            />

            {targetAttr && (
                <Fade in>
                    <Stack spacing={3}>
                        <TextField
                            select
                            label="Operation"
                            value={operation}
                            onChange={(e) => setOperation(e.target.value)}
                            sx={inputStyles}
                        >
                            {filteredOperations.map(op => (
                                <MenuItem key={op} value={op}>{op.replace('_', ' ')}</MenuItem>
                            ))}
                        </TextField>

                        {!NO_VALUE_OPS.includes(operation) && (
                            isLinked ? (
                                <TextField
                                    select
                                    fullWidth
                                    label="Source Attribute"
                                    value={value || ''}
                                    onChange={(e) => setValue(e.target.value)}
                                    sx={inputStyles}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end"
                                                                      sx={{mr: 1}}>{toggleModeButton}</InputAdornment>
                                    }}
                                >
                                    {cleanAvailableLinks.map((link) => (
                                        <MenuItem key={link.id} value={link.id}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: link.entity === 'CUSTOMER' ? '#6366f1' : '#10b981'
                                                }}/>
                                                <Typography variant="body2">{link.name}</Typography>
                                                <Typography variant="caption"
                                                            sx={{opacity: 0.4}}>({link.entity})</Typography>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            ) : (
                                <AttributeField
                                    label={targetAttr.valueType === 'NUMBER' ? "Numeric Value" : targetAttr.valueType === 'DATE' ? "Date & Time" : "Value"}
                                    vType={targetAttr.valueType}
                                    value={value}
                                    onChange={setValue}
                                    endAdornment={toggleModeButton}
                                />
                            )
                        )}
                    </Stack>
                </Fade>
            )}
        </Stack>
    );
}