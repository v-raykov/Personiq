import React, {useMemo} from 'react';
import {Box, Button, Drawer, IconButton, Stack, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material';
import {Close} from '@mui/icons-material';
import 'dayjs/locale/en-gb';

import {createAttributeReaction, createItemReaction} from '@/api';
import {useReactionForm} from '@/hooks/useReactionForm.js';
import AttributeUpdateForm from './AttributeUpdateForm.jsx';
import ItemGrantForm from '@/components/shared/ItemGrantForm.jsx';

const NO_VALUE_OPS = ["INCREMENT", "DECREMENT", "SET_FALSE", "SET_TRUE", "FLIP", "SET_NOW", "CLEAR"];

export default function ReactionBuilder({open, onClose, onSave, fixedRuleId, tenantUri, ruleActionUri}) {
    const form = useReactionForm(open, tenantUri, ruleActionUri);

    const filteredOperations = useMemo(() => {
        if (!form.targetAttr) return ["SET"];
        const vType = (form.targetAttr.valueType || form.targetAttr.type || '').toUpperCase();
        if (form.targetAttr.isList) return ["SET", "APPEND", "PREPEND", "REMOVE", "CLEAR"];

        const ops = ["SET"];
        if (vType === 'NUMBER') ops.push("ADDITION", "SUBTRACTION", "MULTIPLICATION", "DIVISION", "INCREMENT", "DECREMENT");
        if (vType === 'STRING') ops.push("CONCATENATION");
        if (vType === 'BOOLEAN') ops.push("SET_FALSE", "SET_TRUE", "FLIP");
        if (vType === 'DATE') ops.push("SET_NOW");
        return ops;
    }, [form.targetAttr]);

    const availableLinks = useMemo(() => {
        if (!form.targetAttr) return [];
        const vType = (form.targetAttr.valueType || form.targetAttr.type || '').toUpperCase();
        const all = [
            ...form.customerAttrs.map(a => ({...a, group: 'Customer', entity: 'CUSTOMER'})),
            ...form.actionAttrs.map(a => ({...a, group: 'Action Payload', entity: 'ACTION'}))
        ];
        return all.filter(a => (a.valueType || a.type || '').toUpperCase() === vType && a.isList === form.targetAttr.isList);
    }, [form.targetAttr, form.customerAttrs, form.actionAttrs]);

    const handleSave = async () => {
        try {
            if (form.type === 'attribute') {
                await createAttributeReaction(tenantUri, {
                    ruleId: fixedRuleId,
                    attributeId: form.targetAttr.id,
                    operation: form.operation,
                    value: NO_VALUE_OPS.includes(form.operation) ? null : form.value,
                    isValueAttributeId: form.isLinked
                });
            } else {
                await createItemReaction(tenantUri, {
                    ruleId: fixedRuleId,
                    itemId: form.selectedTemplate,
                    itemAttributes: form.itemFields
                });
            }
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose} slotProps={{
            paper: {
                sx: {
                    width: 500,
                    bgcolor: '#0f172a',
                    p: 4,
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    backgroundImage: 'none'
                }
            }
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight={900} color="white">New Reaction</Typography>
                <IconButton onClick={onClose} sx={{color: 'white'}}><Close/></IconButton>
            </Stack>

            <ToggleButtonGroup
                fullWidth value={form.type} exclusive onChange={(e, v) => v && form.setType(v)}
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
                        '&.Mui-selected': {
                            bgcolor: '#6366f1',
                            color: '#fff',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                        }
                    }
                }}
            >
                <ToggleButton value="attribute">Update Attribute</ToggleButton>
                <ToggleButton value="item">Grant Item</ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{flexGrow: 1}}>
                {form.type === 'attribute' ? (
                    <AttributeUpdateForm
                        customerAttrs={form.customerAttrs}
                        targetAttr={form.targetAttr}
                        setTargetAttr={form.setTargetAttr}
                        operation={form.operation}
                        setOperation={form.setOperation}
                        value={form.value}
                        setValue={form.setValue}
                        isLinked={form.isLinked}
                        setIsLinked={form.setIsLinked}
                        availableLinks={availableLinks}
                        filteredOperations={filteredOperations}
                    />
                ) : (
                    <ItemGrantForm
                        items={form.items}
                        itemFields={form.itemFields}
                        setItemFields={form.setItemFields}
                        selectedTemplate={form.selectedTemplate}
                        setSelectedTemplate={form.setSelectedTemplate}
                    />
                )}
            </Box>

            <Button
                fullWidth variant="contained"
                disabled={form.type === 'attribute' ? !form.targetAttr : !form.selectedTemplate}
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
    );
}