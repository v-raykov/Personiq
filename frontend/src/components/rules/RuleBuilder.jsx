import React, {useEffect, useState} from 'react';
import {Box, Button, Dialog, DialogContent, IconButton, MenuItem, Stack, TextField, Typography} from '@mui/material';
import {AccountTree, AddCircleOutline, Close, Save} from '@mui/icons-material';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {createRule, getActions, getCustomerAttributes} from '@/api';
import RecursiveNode from './RecursiveNode';
import {cleanTree, generateExpression, getInitialValue} from './operators';

const fieldStyles = {
    '& .MuiOutlinedInput-root': {
        color: '#fff',
        borderRadius: '12px',
        bgcolor: 'rgba(255,255,255,0.05)',
        '& fieldset': {borderColor: 'rgba(255,255,255,0.1)'},
        '&:hover fieldset': {borderColor: 'rgba(255,255,255,0.2)'},
    }
};

const SidebarMeta = ({entity, type, isList, color}) => (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{mt: 0.5}}>
        <Typography sx={{color: color, fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase'}}>
            {entity}
        </Typography>
        <Typography sx={{color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem', fontWeight: 900}}>•</Typography>
        <Typography sx={{color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', fontWeight: 900}}>
            {type}
        </Typography>
        {isList && (
            <>
                <Typography sx={{color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem', fontWeight: 900}}>•</Typography>
                <Typography sx={{color: '#f59e0b', fontSize: '0.6rem', fontWeight: 900}}>LIST</Typography>
            </>
        )}
    </Stack>
);

export default function RuleBuilder({open, onClose, onSave, tenantUri}) {
    const [actions, setActions] = useState([]);
    const [customerAttributes, setCustomerAttributes] = useState([]);
    const [selectedActionId, setSelectedActionId] = useState('');
    const [tree, setTree] = useState({id: 'root', type: 'group', operator: 'AND', children: []});
    const [draggingId, setDraggingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

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
        setTree({id: 'root', type: 'group', operator: 'AND', children: []});
    }, [selectedActionId]);

    const currentAction = actions.find(a => a.id === selectedActionId);

    const allAttributes = !selectedActionId ? [] : [
        ...(currentAction?.attributes || []).map(a => ({
            id: a.id,
            name: a.name,
            entity: 'ACTION',
            color: '#10b981',
            valueType: a.valueType || 'STRING',
            isList: a.isList || false
        })),
        ...customerAttributes.map(a => ({
            id: a.id,
            name: a.name,
            entity: 'CUSTOMER',
            color: '#6366f1',
            valueType: a.valueType || 'STRING',
            isList: a.isList || false
        }))
    ];

    const handleDrop = (e, targetId, mode) => {
        e.preventDefault();
        e.stopPropagation();
        const entity = e.dataTransfer.getData("entity");
        const attrName = e.dataTransfer.getData("attrName");
        const valueType = e.dataTransfer.getData("valueType");
        const isList = e.dataTransfer.getData("isList") === 'true';
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
            const attr = allAttributes.find(a => a.name === attrName && a.entity === entity);
            newItem = {
                id: `cond-${crypto.randomUUID()}`,
                type: 'condition',
                attrId: attr?.id,
                entity,
                attrName,
                valueType,
                isList,
                operator: isList ? '~' : '=',
                val: getInitialValue(valueType),
                valueMode: 'literal'
            };
        }

        const insertNode = (list) => {
            return list.reduce((acc, node) => {
                if (node.id === targetId) {
                    if (mode === 'nest') {
                        return [...acc, {
                            id: `group-${crypto.randomUUID()}`,
                            type: 'group',
                            operator: 'AND',
                            children: [node, newItem]
                        }];
                    }
                    return [...acc, node, newItem];
                }
                if (node.children) return [...acc, {...node, children: insertNode(node.children)}];
                return [...acc, node];
            }, []);
        };

        const updated = targetId === 'root' ? [...currentChildren, newItem] : insertNode(currentChildren);
        setTree({...tree, children: cleanTree(updated)});
        setDraggingId(null);
    };

    const modifyNode = (id, data) => {
        const rec = (node) => {
            if (node.id === id) return {...node, ...data};
            if (node.children) return {...node, children: node.children.map(rec)};
            return node;
        };
        if (id === 'root') setTree(prev => ({...prev, ...data}));
        else setTree(prev => ({...prev, children: prev.children.map(rec)}));
    };

    const deleteNode = (id) => {
        const removeRec = (list) => list
            .filter(n => n.id !== id)
            .map(n => n.children ? {...n, children: removeRec(n.children)} : n);
        setTree(prev => ({...prev, children: cleanTree(removeRec(prev.children))}));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const expression = generateExpression(tree, allAttributes);
            const payload = {
                triggeredByActionId: parseInt(selectedActionId),
                ruleExpression: expression
            };
            await createRule(tenantUri, payload);
            if (onSave) onSave();
            onClose();
        } catch (err) {
            console.error("Failed to save rule:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: '#0f172a',
                            borderRadius: '32px',
                            height: '90vh',
                            backgroundImage: 'none'
                        }
                    }
                }}
            >
                <IconButton onClick={onClose}
                            sx={{position: 'absolute', right: 24, top: 24, color: 'rgba(255,255,255,0.3)', zIndex: 10}}>
                    <Close/>
                </IconButton>

                <DialogContent sx={{p: 0, display: 'flex', overflow: 'hidden'}}>
                    <Box sx={{
                        width: 320,
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        p: 3,
                        bgcolor: 'rgba(0,0,0,0.2)',
                        overflowY: 'auto'
                    }}>
                        <Typography sx={{
                            color: '#94a3b8',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            mb: 2,
                            letterSpacing: '0.05em'
                        }}>
                            Trigger Action
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            value={selectedActionId}
                            onChange={(e) => setSelectedActionId(e.target.value)}
                            sx={fieldStyles}
                            size="small"
                        >
                            {actions.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                        </TextField>

                        {selectedActionId && (
                            <Stack spacing={1.5} sx={{mt: 4}}>
                                <Typography sx={{
                                    color: '#94a3b8',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    Available Attributes
                                </Typography>
                                {allAttributes.map((attr, idx) => (
                                    <Box
                                        key={idx}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData("entity", attr.entity);
                                            e.dataTransfer.setData("attrName", attr.name);
                                            e.dataTransfer.setData("valueType", attr.valueType);
                                            e.dataTransfer.setData("isList", attr.isList);
                                        }}
                                        sx={{
                                            p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.06)', cursor: 'grab',
                                            transition: 'all 0.2s',
                                            '&:hover': {borderColor: attr.color, bgcolor: 'rgba(255,255,255,0.06)'}
                                        }}
                                    >
                                        <Typography sx={{
                                            color: '#f8fafc',
                                            fontSize: '0.8rem',
                                            fontWeight: 600
                                        }}>{attr.name}</Typography>
                                        <SidebarMeta entity={attr.entity} type={attr.valueType} isList={attr.isList}
                                                     color={attr.color}/>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>

                    <Box
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, 'root')}
                        sx={{
                            flexGrow: 1,
                            p: 4,
                            bgcolor: '#0b1120',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <Box sx={{width: '100%', maxWidth: '1000px'}}>
                            <Box sx={{
                                p: 4,
                                borderRadius: '32px',
                                bgcolor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                mb: 3
                            }}>
                                <Stack direction="row" spacing={2.5} alignItems="center" sx={{mb: 3}}>
                                    <AccountTree sx={{color: '#818cf8', fontSize: '2rem'}}/>
                                    <Typography variant="h5" fontWeight={900}
                                                sx={{color: '#fff', letterSpacing: '-0.02em'}}>
                                        {currentAction?.name.toUpperCase() || 'SELECT AN ACTION'}
                                    </Typography>
                                </Stack>

                                <Box sx={{minHeight: '300px', py: 2}}>
                                    {tree.children.length === 0 ? (
                                        <Box sx={{
                                            border: '2px dashed rgba(255,255,255,0.05)',
                                            borderRadius: '24px',
                                            p: 10,
                                            textAlign: 'center',
                                            color: 'rgba(255,255,255,0.2)'
                                        }}>
                                            <AddCircleOutline sx={{fontSize: '3.5rem', mb: 2, opacity: 0.5}}/>
                                            <Typography variant="h6" fontWeight={500}>Drag and drop attributes to build
                                                logic</Typography>
                                        </Box>
                                    ) : (
                                        <RecursiveNode
                                            node={tree}
                                            allAttributes={allAttributes}
                                            onDrop={handleDrop}
                                            onUpdate={modifyNode}
                                            onDelete={deleteNode}
                                            draggingId={draggingId}
                                            setDraggingId={setDraggingId}
                                        />
                                    )}
                                </Box>
                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                disabled={tree.children.length === 0 || isSaving}
                                onClick={handleSave}
                                startIcon={<Save/>}
                                sx={{
                                    borderRadius: '16px', bgcolor: '#6366f1', py: 2, fontWeight: 800, fontSize: '1rem',
                                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                                    '&:hover': {bgcolor: '#4f46e5'}
                                }}
                            >
                                {isSaving ? 'Saving...' : 'Save Rule'}
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </LocalizationProvider>
    );
}