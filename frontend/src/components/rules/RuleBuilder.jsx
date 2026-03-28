import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Box, Typography, Stack, TextField, MenuItem, Button, IconButton } from '@mui/material';
import { AccountTree, AddCircleOutline, Close } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getActions, getCustomerAttributes } from '../../api';
import RecursiveNode from './RecursiveNode';
import { getInitialValue, cleanTree } from './operators';

export default function RuleBuilder({ open, onClose, tenantUri }) {
    const [actions, setActions] = useState([]);
    const [customerAttributes, setCustomerAttributes] = useState([]);
    const [selectedActionId, setSelectedActionId] = useState('');
    const [tree, setTree] = useState({ id: 'root', type: 'group', operator: 'AND', children: [] });
    const [draggingId, setDraggingId] = useState(null);

    useEffect(() => {
        if (open && tenantUri) {
            Promise.all([getActions(tenantUri), getCustomerAttributes(tenantUri)])
                .then(([a, c]) => {
                    setActions(a.data || []);
                    setCustomerAttributes(c.data || []);
                });
        }
    }, [open, tenantUri]);

    useEffect(() => {
        setTree({ id: 'root', type: 'group', operator: 'AND', children: [] });
    }, [selectedActionId]);

    const currentAction = actions.find(a => a.id === selectedActionId);
    const allAttributes = !selectedActionId ? [] : [
        ...(currentAction?.attributes || []).map(a => ({ name: typeof a === 'object' ? a.name : a, entity: 'ACTION', color: '#10b981', valueType: a.valueType || 'STRING' })),
        ...customerAttributes.map(a => ({ name: a.name, entity: 'CUSTOMER', color: '#6366f1', valueType: a.valueType || 'STRING' }))
    ];

    const handleDrop = (e, targetId, mode) => {
        e.preventDefault(); e.stopPropagation();
        const entity = e.dataTransfer.getData("entity");
        const attrName = e.dataTransfer.getData("attrName");
        const valueType = e.dataTransfer.getData("valueType");
        const sourceId = e.dataTransfer.getData("sourceId");

        let newItem;
        let currentChildren = JSON.parse(JSON.stringify(tree.children));

        if (sourceId) {
            const findAndRemove = (list) => {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === sourceId) {
                        newItem = list[i];
                        list.splice(i, 1);
                        return true;
                    }
                    if (list[i].children && findAndRemove(list[i].children)) return true;
                }
                return false;
            };
            findAndRemove(currentChildren);
        } else {
            if (!entity) return;
            newItem = {
                id: `cond-${crypto.randomUUID()}`, type: 'condition', entity, attrName, valueType,
                operator: '=', val: getInitialValue(valueType)
            };
        }

        const insertNode = (list) => {
            return list.reduce((acc, node) => {
                if (node.id === targetId) {
                    return mode === 'nest'
                        ? [...acc, { id: `group-${crypto.randomUUID()}`, type: 'group', operator: 'AND', children: [node, newItem] }]
                        : [...acc, node, newItem];
                }
                if (node.children) return [...acc, { ...node, children: insertNode(node.children) }];
                return [...acc, node];
            }, []);
        };

        const updated = targetId === 'root' ? [...currentChildren, newItem] : insertNode(currentChildren);
        setTree({ ...tree, children: cleanTree(updated) });
        setDraggingId(null);
    };

    const modifyNode = (id, data) => {
        const rec = (node) => {
            if (node.id === id) return { ...node, ...data };
            if (node.children) return { ...node, children: node.children.map(rec) };
            return node;
        };
        if (id === 'root') setTree(prev => ({ ...prev, ...data }));
        else setTree(prev => ({ ...prev, children: prev.children.map(rec) }));
    };

    const deleteNode = (id) => {
        const removeRec = (list) => list.filter(n => n.id !== id).map(n => n.children ? { ...n, children: removeRec(n.children) } : n);
        setTree(prev => ({ ...prev, children: cleanTree(removeRec(prev.children)) }));
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { bgcolor: '#0f172a', borderRadius: '32px', height: '90vh' } }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 24, top: 24, color: 'rgba(255,255,255,0.3)' }}><Close /></IconButton>
                <DialogContent sx={{ p: 0, display: 'flex', overflow: 'hidden' }}>
                    <Box sx={{ width: 280, borderRight: '1px solid rgba(255,255,255,0.05)', p: 3, bgcolor: 'rgba(0,0,0,0.2)', overflowY: 'auto' }}>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', mb: 2 }}>Trigger Action</Typography>
                        <TextField select fullWidth value={selectedActionId} onChange={(e) => setSelectedActionId(e.target.value)} sx={fieldStyles} size="small">
                            {actions.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                        </TextField>

                        {selectedActionId && (
                            <Stack spacing={1.5} sx={{ mt: 4 }}>
                                <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>Available Attributes</Typography>
                                {allAttributes.map((attr, idx) => (
                                    <Box key={idx} draggable onDragStart={(e) => { e.dataTransfer.setData("entity", attr.entity); e.dataTransfer.setData("attrName", attr.name); e.dataTransfer.setData("valueType", attr.valueType); }}
                                         sx={{ p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'grab', '&:hover': { borderColor: attr.color } }}>
                                        <Typography sx={{ color: '#f8fafc', fontSize: '0.8rem', fontWeight: 500 }}>{attr.name}</Typography>
                                        <Typography sx={{ color: attr.color, fontSize: '0.55rem', fontWeight: 900, mt: 0.5 }}>{attr.entity} • {attr.valueType}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>

                    <Box onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'root')} sx={{ flexGrow: 1, p: 6, bgcolor: '#0b1120', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ p: 4, borderRadius: '32px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'inline-flex', flexDirection: 'column', minWidth: '750px', height: 'fit-content' }}>
                            <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
                                <AccountTree sx={{ color: '#818cf8', fontSize: '2rem' }} />
                                <Typography variant="h5" fontWeight={900} sx={{ color: '#fff' }}>{currentAction?.name.toUpperCase() || 'NEW RULE'}</Typography>
                            </Stack>
                            <Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.06)', mb: 4 }} />
                            <Box sx={{ minHeight: '300px' }}>
                                <RecursiveNode node={tree} onDrop={handleDrop} onUpdate={modifyNode} onDelete={deleteNode} draggingId={draggingId} setDraggingId={setDraggingId} />
                            </Box>
                            <Button variant="contained" disabled={tree.children.length === 0} onClick={() => console.log("Final Tree:", tree)} sx={{ mt: 4, borderRadius: '12px', bgcolor: '#6366f1', py: 1.5, fontWeight: 800 }}>Save Rule</Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </LocalizationProvider>
    );
}

const fieldStyles = { '& .MuiOutlinedInput-root': { color: '#fff', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } };