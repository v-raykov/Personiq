import React, { useState, useEffect } from 'react';
import {
    Drawer, Box, Typography, TextField, Button, MenuItem,
    ToggleButton, ToggleButtonGroup, Stack, Autocomplete,
    IconButton, InputAdornment, Divider, Fade
} from '@mui/material';
import { Link, LinkOff, Close, Save } from '@mui/icons-material';
import {
    createAttributeReaction, createItemReaction, getCustomerAttributes,
    getActionById, getItemGrantedSchema, getItems
} from '../../api';

const OPERATIONS = [
    "ADDITION", "SUBTRACTION", "MULTIPLICATION", "DIVISION", "INCREMENT",
    "DECREMENT", "CONCATENATION", "SET_FALSE", "SET_TRUE", "FLIP",
    "SET", "SET_NOW", "APPEND", "PREPEND", "REMOVE", "CLEAR"
];

const NO_VALUE_OPS = ["INCREMENT", "DECREMENT", "SET_FALSE", "SET_TRUE", "FLIP", "SET_NOW", "CLEAR"];

export default function ReactionBuilder({ open, onClose, onSave, fixedRuleId, tenantUri, ruleActionUri }) {
    const [type, setType] = useState('attribute');
    const [targetAttr, setTargetAttr] = useState(null);
    const [operation, setOperation] = useState('SET');
    const [value, setValue] = useState('');
    const [isLinked, setIsLinked] = useState(false);

    const [customerAttrs, setCustomerAttrs] = useState([]);
    const [actionAttrs, setActionAttrs] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [itemFields, setItemFields] = useState({});

    useEffect(() => {
        if (open) {
            getCustomerAttributes(tenantUri).then(res => setCustomerAttrs(res.data || []));
            getItems(tenantUri).then(res => setItems(res.data || []));
            if (ruleActionUri) {
                getActionById(tenantUri, ruleActionUri).then(res => setActionAttrs(res.data?.attributes || []));
            }
            // Reset form on open
            setTargetAttr(null);
            setSelectedTemplate(null);
        }
    }, [open, tenantUri, ruleActionUri]);

    const handleTemplateChange = async (val) => {
        setSelectedTemplate(val);
        const res = await getItemGrantedSchema(tenantUri, val);
        const fields = {};
        (res.data || []).forEach(attr => fields[attr.id] = '');
        setItemFields(fields);
    };

    const handleSave = async () => {
        try {
            if (type === 'attribute') {
                await createAttributeReaction(tenantUri, {
                    ruleId: fixedRuleId,
                    attributeId: targetAttr,
                    operation,
                    value: NO_VALUE_OPS.includes(operation) ? null : value,
                    isValueAttributeId: isLinked
                });
            } else {
                await createItemReaction(tenantUri, {
                    ruleId: fixedRuleId,
                    itemId: selectedTemplate,
                    itemAttributes: itemFields
                });
            }
            onSave();
            onClose();
        } catch (err) { console.error(err); }
    };

    const allAvailableAttributes = [
        ...customerAttrs.map(a => ({ ...a, group: 'Customer' })),
        ...actionAttrs.map(a => ({ ...a, group: 'Action Payload' }))
    ];

    return (
        <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 500, bgcolor: '#0f172a', p: 4, borderLeft: '1px solid rgba(255,255,255,0.1)' } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight={900} color="white">New Reaction</Typography>
                <IconButton onClick={onClose} sx={{ color: 'white' }}><Close /></IconButton>
            </Stack>

            <ToggleButtonGroup
                fullWidth
                value={type}
                exclusive
                onChange={(e, v) => v && setType(v)}
                sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', p: 0.5 }}
            >
                <ToggleButton value="attribute" sx={{ color: 'white', borderRadius: '10px !important', fontWeight: 800 }}>Update Attribute</ToggleButton>
                <ToggleButton value="item" sx={{ color: 'white', borderRadius: '10px !important', fontWeight: 800 }}>Grant Item</ToggleButton>
            </ToggleButtonGroup>

            <Stack spacing={3}>
                {type === 'attribute' ? (
                    <>
                        <Autocomplete
                            options={customerAttrs}
                            getOptionLabel={(option) => option.name}
                            onChange={(e, v) => setTargetAttr(v?.id)}
                            renderInput={(params) => <TextField {...params} label="Select Target Attribute" required />}
                        />

                        {targetAttr && (
                            <Fade in>
                                <Stack spacing={3}>
                                    <TextField
                                        select
                                        label="Operation"
                                        value={operation}
                                        onChange={(e) => setOperation(e.target.value)}
                                    >
                                        {OPERATIONS.map(op => <MenuItem key={op} value={op}>{op}</MenuItem>)}
                                    </TextField>

                                    {!NO_VALUE_OPS.includes(operation) && (
                                        isLinked ? (
                                            <Autocomplete
                                                options={allAvailableAttributes}
                                                groupBy={(option) => option.group}
                                                getOptionLabel={(option) => option.name}
                                                onChange={(e, v) => setValue(v?.id?.toString())}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Source Attribute"
                                                               InputProps={{ ...params.InputProps,
                                                                   endAdornment: <InputAdornment position="end"><IconButton onClick={() => setIsLinked(false)}><LinkOff color="primary"/></IconButton></InputAdornment>
                                                               }}
                                                    />
                                                )}
                                            />
                                        ) : (
                                            <TextField
                                                fullWidth
                                                label="Value"
                                                value={value}
                                                onChange={(e) => setValue(e.target.value)}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setIsLinked(true)}><Link /></IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        )
                                    )}
                                </Stack>
                            </Fade>
                        )}
                    </>
                ) : (
                    <>
                        <Autocomplete
                            options={items}
                            getOptionLabel={(option) => option.name || `Item #${option.id}`}
                            onChange={(e, v) => handleTemplateChange(v?.id)}
                            renderInput={(params) => <TextField {...params} label="Select Item to Grant" required />}
                        />

                        {selectedTemplate && (
                            <Box sx={{ mt: 2, p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 900, mb: 3, display: 'block', letterSpacing: 1 }}>CONFIGURE GRANTED ATTRIBUTES</Typography>
                                <Stack spacing={2}>
                                    {Object.keys(itemFields).map(attrId => (
                                        <TextField
                                            key={attrId}
                                            fullWidth
                                            size="small"
                                            label={`Attribute ID: ${attrId}`}
                                            value={itemFields[attrId]}
                                            onChange={(e) => setItemFields({ ...itemFields, [attrId]: e.target.value })}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </>
                )}

                <Button
                    fullWidth
                    variant="contained"
                    disabled={type === 'attribute' ? !targetAttr : !selectedTemplate}
                    onClick={handleSave}
                    sx={{ py: 2, borderRadius: '12px', fontWeight: 800, background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)' }}
                >
                    Create Reaction
                </Button>
            </Stack>
        </Drawer>
    );
}