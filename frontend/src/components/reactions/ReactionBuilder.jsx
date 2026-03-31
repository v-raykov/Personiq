import React, {useEffect, useMemo, useState} from 'react';
import {Box, Button, Drawer, IconButton, Stack, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material';
import {Close} from '@mui/icons-material';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/en-gb';

import {createAttributeReaction, createItemReaction, getActionById, getCustomerAttributes, getItems} from '../../api';
import AttributeUpdateForm from './create/AttributeUpdateForm.jsx';
import ItemGrantForm from './create/ItemGrantForm.jsx';

const NO_VALUE_OPS = ["INCREMENT", "DECREMENT", "SET_FALSE", "SET_TRUE", "FLIP", "SET_NOW", "CLEAR"];

export default function ReactionBuilder({open, onClose, onSave, fixedRuleId, tenantUri, ruleActionUri}) {
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
            setTargetAttr(null);
            setSelectedTemplate(null);
            setOperation('SET');
            setValue('');
            setIsLinked(false);
            setItemFields({});
        }
    }, [open, tenantUri, ruleActionUri]);

    const filteredOperations = useMemo(() => {
        if (!targetAttr) return ["SET"];
        const {valueType: vType, isList} = targetAttr;
        if (isList) return ["SET", "APPEND", "PREPEND", "REMOVE", "CLEAR"];
        const ops = ["SET"];
        if (vType === 'NUMBER') ops.push("ADDITION", "SUBTRACTION", "MULTIPLICATION", "DIVISION", "INCREMENT", "DECREMENT");
        if (vType === 'STRING') ops.push("CONCATENATION");
        if (vType === 'BOOLEAN') ops.push("SET_FALSE", "SET_TRUE", "FLIP");
        if (vType === 'DATE') ops.push("SET_NOW");
        return ops;
    }, [targetAttr]);

    const availableLinks = useMemo(() => {
        if (!targetAttr) return [];
        const all = [
            ...customerAttrs.map(a => ({...a, group: 'Customer', entity: 'CUSTOMER'})),
            ...actionAttrs.map(a => ({...a, group: 'Action Payload', entity: 'ACTION'}))
        ];
        return all.filter(a => a.valueType === targetAttr.valueType && a.isList === targetAttr.isList);
    }, [targetAttr, customerAttrs, actionAttrs]);

    const handleSave = async () => {
        try {
            if (type === 'attribute') {
                await createAttributeReaction(tenantUri, {
                    ruleId: fixedRuleId,
                    attributeId: targetAttr.id,
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
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{
                sx: {width: 500, bgcolor: '#0f172a', p: 4, borderLeft: '1px solid rgba(255,255,255,0.1)'}
            }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" fontWeight={900} color="white">New Reaction</Typography>
                    <IconButton onClick={onClose} sx={{color: 'white'}}><Close/></IconButton>
                </Stack>

                <ToggleButtonGroup
                    fullWidth
                    value={type}
                    exclusive
                    onChange={(e, v) => v && setType(v)}
                    sx={{
                        mb: 4,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px',
                        p: 0.5,
                        '& .MuiToggleButton-root': {
                            color: '#94a3b8',
                            border: 'none',
                            borderRadius: '16px',
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            transition: '0.3s',
                            '&.Mui-selected': {
                                bgcolor: '#6366f1',
                                color: '#fff',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                                '&:hover': {bgcolor: '#4f46e5'}
                            },
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.08)',
                                color: '#fff'
                            }
                        }
                    }}
                >
                    <ToggleButton value="attribute">
                        Update Attribute
                    </ToggleButton>
                    <ToggleButton value="item">
                        Grant Item
                    </ToggleButton>
                </ToggleButtonGroup>

                <Box sx={{flexGrow: 1}}>
                    {type === 'attribute' ? (
                        <AttributeUpdateForm
                            customerAttrs={customerAttrs}
                            targetAttr={targetAttr}
                            setTargetAttr={setTargetAttr}
                            operation={operation}
                            setOperation={setOperation}
                            value={value}
                            setValue={setValue}
                            isLinked={isLinked}
                            setIsLinked={setIsLinked}
                            availableLinks={availableLinks}
                            filteredOperations={filteredOperations}
                        />
                    ) : (
                        <ItemGrantForm
                            items={items}
                            itemFields={itemFields}
                            setItemFields={setItemFields}
                            selectedTemplate={selectedTemplate}
                            setSelectedTemplate={setSelectedTemplate}
                        />
                    )}
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    disabled={type === 'attribute' ? !targetAttr : !selectedTemplate}
                    onClick={handleSave}
                    sx={{
                        py: 2,
                        mt: 4,
                        borderRadius: '12px',
                        fontWeight: 800,
                        background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)'
                    }}
                >
                    Create Reaction
                </Button>
            </Drawer>
        </LocalizationProvider>
    );
}