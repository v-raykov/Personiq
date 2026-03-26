import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, Box, Typography, IconButton,
    Stack, TextField, MenuItem, Paper, InputBase, Button
} from '@mui/material';
import {
    DeleteOutline, AccountTree, AddCircleOutline
} from '@mui/icons-material';
import { getActions, getCustomerAttributes } from '../../api';

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

    // RESET CANVAS WHEN TRIGGER CHANGES
    useEffect(() => {
        setTree({ id: 'root', type: 'group', operator: 'AND', children: [] });
    }, [selectedActionId]);

    const currentAction = actions.find(a => a.id === selectedActionId);

    const allAttributes = !selectedActionId ? [] : [
        ...(currentAction?.attributes || []).map(a => ({
            name: typeof a === 'object' ? a.name : a,
            entity: 'ACTION',
            color: '#10b981'
        })),
        ...customerAttributes.map(a => ({
            name: a.name,
            entity: 'CUSTOMER',
            color: '#6366f1'
        }))
    ];

    const cleanTree = (nodes) => {
        return nodes
            .filter(n => n !== null && n !== undefined)
            .map(n => n.children ? { ...n, children: cleanTree(n.children) } : n)
            .filter(n => n.type === 'condition' || (n.children && n.children.length > 0));
    };

    const handleDrop = (e, targetId, mode) => {
        e.preventDefault(); e.stopPropagation();
        const entity = e.dataTransfer.getData("entity");
        const attrName = e.dataTransfer.getData("attrName");
        const sourceId = e.dataTransfer.getData("sourceId");

        let newItem;
        let currentTree = JSON.parse(JSON.stringify(tree.children));

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
            findAndRemove(currentTree);
        } else {
            if (!entity) return;
            newItem = { id: `cond-${crypto.randomUUID()}`, type: 'condition', entity, attrName, val: '' };
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

        const updatedChildren = targetId === 'root' ? [...currentTree, newItem] : insertNode(currentTree);
        setTree({ ...tree, children: cleanTree(updatedChildren) });
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
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { bgcolor: '#0f172a', borderRadius: '32px', height: '90vh' } }}>
            <DialogContent sx={{ p: 0, display: 'flex', overflow: 'hidden' }}>
                <Box sx={{ width: 280, borderRight: '1px solid rgba(255,255,255,0.05)', p: 3, bgcolor: 'rgba(0,0,0,0.2)', overflowY: 'auto' }}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', mb: 2, ml: 1 }}>Trigger</Typography>
                    <TextField select fullWidth value={selectedActionId} onChange={(e) => setSelectedActionId(e.target.value)} sx={fieldStyles} size="small" margin="dense">
                        {actions.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                    </TextField>

                    {selectedActionId && (
                        <>
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', mt: 4, mb: 2, ml: 1 }}>Attributes</Typography>
                            <Stack spacing={1.5}>
                                {allAttributes.map((attr, idx) => (
                                    <SourcePill key={`${attr.entity}-${idx}`} label={attr.name} entity={attr.entity} color={attr.color} />
                                ))}
                            </Stack>
                        </>
                    )}
                </Box>

                <Box onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'root')}
                     sx={{ flexGrow: 1, p: 6, bgcolor: '#0b1120', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ p: 4, borderRadius: '32px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'inline-flex', flexDirection: 'column', minWidth: '650px', height: 'fit-content' }}>
                        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
                            <Box sx={{ p: 1.8, bgcolor: 'rgba(99, 102, 241, 0.12)', borderRadius: '18px' }}><AccountTree sx={{ color: '#818cf8', fontSize: '2rem' }} /></Box>
                            <Typography variant="h5" fontWeight={900} sx={{ color: '#fff' }}>{currentAction?.name.toUpperCase() || 'NEW RULE'}</Typography>
                        </Stack>
                        <Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.06)', mb: 4 }} />

                        <Box sx={{ ml: 2, minHeight: '200px', mb: 4 }}>
                            {!selectedActionId ? (
                                <Box sx={{ p: 8, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                                    <Typography fontWeight={600}>Please select a trigger to begin</Typography>
                                </Box>
                            ) : tree.children.length === 0 ? (
                                <Box sx={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px', p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'rgba(255,255,255,0.2)' }}>
                                    <AddCircleOutline sx={{ fontSize: '3rem' }} /><Typography fontWeight={600}>Drag attributes here</Typography>
                                </Box>
                            ) : (
                                <RecursiveNode node={tree} onDrop={handleDrop} onUpdate={modifyNode} onDelete={deleteNode} draggingId={draggingId} setDraggingId={setDraggingId} />
                            )}
                        </Box>
                        {/* DISABLED UNLESS VALID */}
                        <Button
                            variant="contained"
                            disabled={!selectedActionId || tree.children.length === 0}
                            onClick={() => console.log(tree)}
                            sx={{ borderRadius: '12px', bgcolor: '#6366f1', py: 1.5, fontWeight: 800, '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.1)' } }}
                        >
                            Save Rule Configuration
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

const RecursiveNode = ({ node, onDrop, onUpdate, onDelete, draggingId, setDraggingId }) => {
    if (!node) return null;
    const isGroup = node.type === 'group';
    const themeColor = node.operator === 'OR' ? '#f59e0b' : '#6366f1';
    const showLogic = isGroup && node.children && node.children.length > 1;

    if (!isGroup) return <BuilderPill item={node} onDrop={onDrop} onDelete={() => onDelete(node.id)} onUpdate={(data) => onUpdate(node.id, data)} draggingId={draggingId} setDraggingId={setDraggingId} />;

    return (
        <Box sx={{ position: 'relative', pl: showLogic ? '40px' : 0, display: 'flex', flexDirection: 'column' }}>
            {showLogic && (
                <Box onClick={() => onUpdate(node.id, { operator: node.operator === 'AND' ? 'OR' : 'AND' })}
                     sx={{ position: 'absolute', left: -14, top: 0, zIndex: 10, cursor: 'pointer', bgcolor: themeColor, color: '#fff', px: 1, py: 0.3, borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}>
                    {node.operator}
                </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {node.children.map((child, i) => (
                    <Box key={child.id} sx={{
                        position: 'relative', display: 'flex', alignItems: 'center',
                        '&::before': showLogic ? {
                            content: '""', position: 'absolute', left: -40, width: '2px', bgcolor: themeColor, opacity: 0.4,
                            top: i === 0 ? '12px' : 0, // Vertical line starts from the top of the label
                            bottom: i === node.children.length - 1 ? '50%' : 0
                        } : {},
                        '&::after': showLogic ? {
                            content: '""', position: 'absolute', left: -40, top: '50%', width: '40px', height: '2px', bgcolor: themeColor, opacity: 0.4
                        } : {}
                    }}>
                        <Box sx={{ py: 1.25 }}>
                            <RecursiveNode node={child} onDrop={onDrop} onUpdate={onUpdate} onDelete={onDelete} draggingId={draggingId} setDraggingId={setDraggingId} />
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

const BuilderPill = ({ item, onDrop, onDelete, onUpdate, draggingId, setDraggingId }) => {
    const [dropMode, setDropMode] = useState(null);
    const entityColor = item.entity === 'CUSTOMER' ? '#6366f1' : '#10b981';
    const isBeingDragged = draggingId === item.id;

    return (
        <Box draggable onDragStart={(e) => { e.stopPropagation(); setDraggingId(item.id); e.dataTransfer.setData("sourceId", item.id); }} onDragEnd={() => setDraggingId(null)}
             sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', opacity: isBeingDragged ? 0.3 : 1, cursor: 'grab' }}>
            <Box sx={{ position: 'relative' }}>
                <Typography variant="caption" sx={{ position: 'absolute', top: -10, right: 12, bgcolor: entityColor, zIndex: 5, color: '#fff', px: 0.8, py: 0.2, borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900 }}>{item.entity}</Typography>
                <Paper
                    onDragOver={(e) => { if (isBeingDragged) return; e.preventDefault(); e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); setDropMode((e.clientY - rect.top) < rect.height * 0.4 ? 'nest' : 'after'); }}
                    onDragLeave={() => setDropMode(null)}
                    onDrop={(e) => { onDrop(e, item.id, dropMode); setDropMode(null); }}
                    sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: dropMode === 'nest' ? entityColor : (dropMode === 'after' ? '#fff' : 'rgba(255,255,255,0.08)'), borderRadius: '12px', p: '8px 16px', display: 'flex', alignItems: 'center', gap: 1.5, minWidth: '340px' }}
                >
                    <InputBase value={item.attrName} readOnly sx={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 800, flexGrow: 1 }} />
                    <Typography sx={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, fontStyle: 'italic' }}>is</Typography>
                    <InputBase value={item.val} onChange={(e) => onUpdate({ val: e.target.value })} placeholder="..." sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500, width: '80px', bgcolor: 'rgba(0,0,0,0.2)', px: 1, borderRadius: '4px' }} />
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(); }} sx={{ color: 'rgba(255,255,255,0.1)', ml: 1 }}><DeleteOutline fontSize="small" /></IconButton>
                </Paper>
            </Box>
        </Box>
    );
};

const SourcePill = ({ label, entity, color }) => (
    <Box draggable onDragStart={(e) => { e.dataTransfer.setData("entity", entity); e.dataTransfer.setData("attrName", label); }}
         sx={{
             p: '12px 16px', position: 'relative', overflow: 'hidden',
             bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)',
             cursor: 'grab', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255,255,255,0.12)' }
         }}>
        <Typography sx={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: 500 }}>{label}</Typography>
        <Box sx={{ position: 'absolute', top: 6, right: 8, bgcolor: 'rgba(255,255,255,0.05)', px: 0.8, py: 0.2, borderRadius: '4px', border: `1px solid ${color}44` }}>
            <Typography sx={{ color: color, fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase' }}>{entity}</Typography>
        </Box>
    </Box>
);

const fieldStyles = { '& .MuiOutlinedInput-root': { color: '#fff', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } };