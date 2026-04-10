import React, {useEffect, useMemo, useState} from 'react';
import {
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Stack,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import {CardGiftcard, Close, Inventory2, Person} from '@mui/icons-material';
import 'dayjs/locale/en-gb';

import {
    deleteAttributeValue,
    getCustomerAttributes,
    getCustomerInventory,
    getItems,
    grantItem,
    updateCustomerAttributes
} from '@/api';

import UpdateAttributesForm from './UpdateAttributesForm.jsx';
import ItemGrantForm from '@/components/shared/ItemGrantForm.jsx';

export default function UpdateDrawer({open, customer, tenantUri, attributes, onClose, onRefresh}) {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [schema, setSchema] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState(0);

    const [itemBlueprints, setItemBlueprints] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [itemFields, setItemFields] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            if (!open) return;
            try {
                const {data} = await getCustomerAttributes(tenantUri);
                setSchema(data || []);

                if (tab === 1 && customer) {
                    const [invRes, bpRes] = await Promise.all([
                        getCustomerInventory(tenantUri, customer.customerId),
                        getItems(tenantUri)
                    ]);
                    setInventory(invRes.data || []);
                    setItemBlueprints(bpRes.data || []);
                }
            } catch (err) {
                console.error("Fetch failed", err);
            }
        };
        fetchData();
    }, [open, tenantUri, tab, customer]);

    useEffect(() => {
        if (!open) {
            setEditingId(null);
            setEditValue("");
            setTab(0);
            setSelectedTemplate(null);
            setItemFields({});
        }
    }, [open]);

    const customerAttrs = useMemo(() => {
        if (!customer) return [];
        const attrs = attributes[customer.customerId] || [];
        return [...attrs].sort((a, b) => a.name.localeCompare(b.name));
    }, [attributes, customer]);

    const handleUpdate = async (attrId) => {
        setLoading(true);
        try {
            await updateCustomerAttributes(tenantUri, customer.customerId, {[attrId]: editValue});
            setEditingId(null);
            onRefresh();
        } catch (err) {
            console.error("Update failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (attrId) => {
        if (!window.confirm("Reset attribute to default?")) return;
        try {
            await deleteAttributeValue(tenantUri, attrId, customer.customerId);
            onRefresh();
        } catch (err) {
            console.error("Reset failed", err);
        }
    };

    const handleGrantSubmit = async () => {
        setLoading(true);
        try {
            await grantItem(tenantUri, selectedTemplate, customer.customerId, itemFields);
            const invRes = await getCustomerInventory(tenantUri, customer.customerId);
            setInventory(invRes.data || []);
            setSelectedTemplate(null);
            setItemFields({});
            onRefresh();
        } catch (err) {
            console.error("Grant failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            transitionDuration={{enter: 400, exit: 300}}
            slotProps={{
                paper: {
                    sx: {
                        width: {xs: '100%', sm: 550},
                        bgcolor: '#0f172a',
                        backgroundImage: 'none',
                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                        p: 0
                    }
                }
            }}
        >
            <Box sx={{
                opacity: open ? 1 : 0,
                transition: 'opacity 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}>
                <Box sx={{p: 4, pb: 2}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Box>
                            <Typography variant="h4" fontWeight={900} color="#fff">
                                {customer?.username || 'Loading...'}
                            </Typography>
                            <Typography variant="caption" color="#94a3b8" sx={{fontSize: '0.9rem', fontWeight: 700}}>
                                ID: {customer?.customerId}
                            </Typography>
                        </Box>
                        <IconButton onClick={onClose} sx={{color: '#94a3b8'}}>
                            <Close/>
                        </IconButton>
                    </Box>

                    <Tabs
                        value={tab}
                        onChange={(e, v) => setTab(v)}
                        sx={{
                            minHeight: '40px',
                            '& .MuiTabs-indicator': {bgcolor: '#6366f1', height: '3px', borderRadius: '3px'},
                            '& .MuiTab-root': {
                                color: '#64748b',
                                fontWeight: 900,
                                fontSize: '0.8rem',
                                letterSpacing: 1,
                                minHeight: '40px',
                                '&.Mui-selected': {color: '#fff'}
                            }
                        }}
                    >
                        <Tab icon={<Person sx={{fontSize: '1.2rem'}}/>} iconPosition="start" label="ATTRIBUTES"/>
                        <Tab icon={<Inventory2 sx={{fontSize: '1.2rem'}}/>} iconPosition="start" label="INVENTORY"/>
                    </Tabs>
                </Box>

                <Divider sx={{borderColor: 'rgba(255,255,255,0.05)'}}/>

                <Box sx={{p: 4, flexGrow: 1, overflowY: 'auto'}}>
                    {tab === 0 ? (
                        <Box sx={{
                            p: 3,
                            borderRadius: '24px',
                            bgcolor: 'rgba(99, 102, 241, 0.04)',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                        }}>
                            <Typography sx={{
                                color: '#818cf8',
                                fontWeight: 900,
                                fontSize: '0.8rem',
                                letterSpacing: 1.5,
                                mb: 2.5,
                                textTransform: 'uppercase'
                            }}>
                                Profile Data
                            </Typography>
                            <UpdateAttributesForm
                                customerAttrs={customerAttrs}
                                schema={schema}
                                editingId={editingId}
                                editValue={editValue}
                                setEditingId={setEditingId}
                                setEditValue={setEditValue}
                                handleUpdate={handleUpdate}
                                handleReset={handleReset}
                                loading={loading}
                            />
                        </Box>
                    ) : (
                        <Stack spacing={4}>
                            <Box sx={{
                                p: 3,
                                borderRadius: '24px',
                                bgcolor: 'rgba(99, 102, 241, 0.04)',
                                border: '1px solid rgba(99, 102, 241, 0.1)'
                            }}>
                                <Typography sx={{
                                    color: '#818cf8',
                                    fontWeight: 900,
                                    fontSize: '0.8rem',
                                    letterSpacing: 1.5,
                                    mb: 2.5,
                                    textTransform: 'uppercase'
                                }}>
                                    Grant New Item
                                </Typography>

                                <ItemGrantForm
                                    items={itemBlueprints}
                                    itemFields={itemFields}
                                    setItemFields={setItemFields}
                                    selectedTemplate={selectedTemplate}
                                    setSelectedTemplate={setSelectedTemplate}
                                />

                                {selectedTemplate && (
                                    <Button
                                        fullWidth
                                        onClick={handleGrantSubmit}
                                        disabled={loading}
                                        startIcon={<CardGiftcard/>}
                                        sx={{
                                            mt: 3,
                                            py: 2,
                                            borderRadius: '16px',
                                            fontWeight: 900,
                                            background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                                            color: '#fff',
                                            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {loading ? 'PROCESSING...' : 'CONFIRM GRANT'}
                                    </Button>
                                )}
                            </Box>

                            <Box sx={{px: 1}}>
                                <Typography sx={{
                                    color: '#64748b',
                                    fontWeight: 900,
                                    fontSize: '0.8rem',
                                    letterSpacing: 1.5,
                                    mb: 2,
                                    textTransform: 'uppercase'
                                }}>
                                    Current Inventory
                                </Typography>
                                <List disablePadding>
                                    {inventory.length === 0 && (
                                        <Typography sx={{
                                            color: 'rgba(255,255,255,0.1)',
                                            textAlign: 'center',
                                            py: 4,
                                            fontWeight: 700
                                        }}>
                                            NO ITEMS OWNED
                                        </Typography>
                                    )}
                                    {inventory.map((item, idx) => (
                                        <ListItem key={idx} sx={{
                                            p: 2.5,
                                            borderRadius: '20px',
                                            bgcolor: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            mb: 1.5
                                        }}>
                                            <ListItemText
                                                primary={<Typography sx={{
                                                    color: '#fff',
                                                    fontWeight: 800,
                                                    fontSize: '1.1rem'
                                                }}>{item.name}</Typography>}
                                                secondary={<Typography sx={{
                                                    color: '#64748b',
                                                    fontSize: '0.75rem',
                                                    fontFamily: 'monospace'
                                                }}>{item.id}</Typography>}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Stack>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}