import React, {useEffect, useMemo, useState} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import {CardGiftcard, Close, Edit, Inventory2, Person, RestartAlt, Save} from '@mui/icons-material';
import {DateTimePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {renderTimeViewClock} from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';

import {
    deleteAttributeValue,
    getCustomerAttributes,
    getCustomerInventory,
    getItems,
    grantItem,
    updateCustomerAttributes
} from '@/api';

const CustomerEditDrawer = ({open, customer, tenantUri, attributes, onClose, onRefresh}) => {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState(null);
    const [schema, setSchema] = useState([]);
    const [loading, setLoading] = useState(false);

    const [tab, setTab] = useState(0);
    const [itemBlueprints, setItemBlueprints] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [selectedBlueprint, setSelectedBlueprint] = useState(null);
    const [grantForm, setGrantForm] = useState({});

    useEffect(() => {
        const fetchSchema = async () => {
            try {
                const {data} = await getCustomerAttributes(tenantUri);
                setSchema(data || []);
            } catch (err) {
                console.error("Schema fetch failed:", err);
            }
        };
        if (open) fetchSchema();
    }, [open, tenantUri]);

    useEffect(() => {
        const fetchInventoryData = async () => {
            if (open && customer && tab === 1) {
                try {
                    const [invRes, bpRes] = await Promise.all([
                        getCustomerInventory(tenantUri, customer.customerId),
                        getItems(tenantUri)
                    ]);
                    setInventory(invRes.data || []);
                    setItemBlueprints(bpRes.data || []);
                } catch (err) {
                    console.error("Inventory fetch failed:", err);
                }
            }
        };
        fetchInventoryData();
    }, [open, customer, tab, tenantUri]);

    useEffect(() => {
        if (!open) {
            setEditingId(null);
            setEditValue(null);
            setTab(0);
            setSelectedBlueprint(null);
            setGrantForm({});
        }
    }, [open]);

    const customerAttrs = useMemo(() => {
        if (!customer) return [];
        const attrs = attributes[customer.customerId] || [];
        return [...attrs].sort((a, b) => a.name.localeCompare(b.name));
    }, [attributes, customer]);

    const formatReadableDate = (isoString) => {
        if (!isoString) return '—';
        const d = dayjs(isoString);
        return d.isValid() ? d.format('HH:mm DD/MM/YYYY') : isoString;
    };

    const handleUpdate = async (attrId) => {
        setLoading(true);
        try {
            let valueToSend = editValue;
            if (dayjs.isDayjs(editValue)) {
                valueToSend = editValue.isValid() ? editValue.toISOString() : null;
            }
            await updateCustomerAttributes(tenantUri, customer.customerId, {[attrId]: valueToSend});
            setEditingId(null);
            onRefresh();
        } catch (err) {
            console.error("Update failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (attrId) => {
        if (!window.confirm("Reset this attribute to default?")) return;
        try {
            await deleteAttributeValue(tenantUri, attrId, customer.customerId);
            onRefresh();
        } catch (err) {
            console.error("Reset failed:", err);
        }
    };

    const handleSelectBlueprint = (id) => {
        const bp = itemBlueprints.find(b => b.id === id);
        setSelectedBlueprint(bp);
        const initialForm = {};
        bp.attributes.forEach(attr => {
            initialForm[attr.id] = attr.isList ? [] : (attr.valueType === 'BOOLEAN' ? false : '');
        });
        setGrantForm(initialForm);
    };

    const handleGrantSubmit = async () => {
        setLoading(true);
        try {
            await grantItem(tenantUri, selectedBlueprint.id, customer.customerId, grantForm);
            const invRes = await getCustomerInventory(tenantUri, customer.customerId);
            setInventory(invRes.data || []);
            setSelectedBlueprint(null);
            setGrantForm({});
            onRefresh();
        } catch (err) {
            console.error("Grant failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            color: '#fff', borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.02)',
            '& fieldset': {borderColor: 'rgba(255,255,255,0.05)'},
            '&:hover fieldset': {borderColor: '#6366f1'},
            '&.Mui-focused fieldset': {borderColor: '#6366f1'},
        },
        '& .MuiInputLabel-root': {color: '#94a3b8'},
        '& .MuiSvgIcon-root': {color: '#818cf8'}
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
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
                                <Typography variant="caption" color="#94a3b8"
                                            sx={{fontSize: '0.9rem', fontWeight: 700}}>
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
                            <Stack spacing={2.5}>
                                {customerAttrs.map((attr) => {
                                    const type = schema.find(s => s.name === attr.name)?.valueType || 'STRING';
                                    const isEditing = editingId === attr.attributeId;

                                    return (
                                        <Box
                                            key={attr.attributeId}
                                            sx={{
                                                p: 2.5, borderRadius: '24px',
                                                bgcolor: isEditing ? 'rgba(99, 102, 241, 0.04)' : 'rgba(255,255,255,0.02)',
                                                border: isEditing ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1.5}}>
                                                <Typography sx={{
                                                    color: '#64748b',
                                                    fontWeight: 900,
                                                    fontSize: '0.75rem',
                                                    letterSpacing: 1.2
                                                }}>
                                                    {attr.name.toUpperCase()}
                                                </Typography>
                                                <Stack direction="row" spacing={0.5}>
                                                    {isEditing ? (
                                                        <IconButton size="small"
                                                                    onClick={() => handleUpdate(attr.attributeId)}
                                                                    sx={{color: '#10b981'}} disabled={loading}>
                                                            {loading ? <CircularProgress size={16} color="inherit"/> :
                                                                <Save fontSize="small"/>}
                                                        </IconButton>
                                                    ) : (
                                                        <IconButton size="small" onClick={() => {
                                                            setEditingId(attr.attributeId);
                                                            const val = attr.values[0];
                                                            setEditValue(type === 'DATE' ? (val ? dayjs(val) : dayjs()) : (val || ''));
                                                        }} sx={{
                                                            color: 'rgba(255,255,255,0.2)',
                                                            '&:hover': {color: '#818cf8'}
                                                        }}>
                                                            <Edit fontSize="small"/>
                                                        </IconButton>
                                                    )}
                                                    <Tooltip title="Reset">
                                                        <IconButton size="small"
                                                                    onClick={() => handleReset(attr.attributeId)} sx={{
                                                            color: 'rgba(255,255,255,0.1)',
                                                            '&:hover': {color: '#ef4444'}
                                                        }}>
                                                            <RestartAlt fontSize="small"/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </Box>
                                            {isEditing ? (
                                                type === 'DATE' ? (
                                                    <DateTimePicker value={editValue}
                                                                    onChange={(newValue) => setEditValue(newValue)}
                                                                    format="HH:mm DD/MM/YYYY" ampm={false}
                                                                    viewRenderers={{
                                                                        hours: renderTimeViewClock,
                                                                        minutes: renderTimeViewClock
                                                                    }} slotProps={{
                                                        textField: {
                                                            variant: 'standard',
                                                            fullWidth: true,
                                                            autoFocus: true,
                                                            onKeyDown: (e) => e.key === 'Enter' && handleUpdate(attr.attributeId),
                                                            InputProps: {
                                                                disableUnderline: true,
                                                                sx: {color: '#fff', fontSize: '1.2rem', fontWeight: 700}
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
                                                                '& .MuiClockPointer-thumb': {
                                                                    bgcolor: '#6366f1',
                                                                    border: '16px solid #6366f1'
                                                                },
                                                                '& .MuiClock-clock': {bgcolor: '#0f172a'},
                                                                '& .MuiClockNumber-root': {color: '#fff'},
                                                                '& .MuiButtonBase-root': {color: '#818cf8'}
                                                            }
                                                        }
                                                    }}/>
                                                ) : type === 'BOOLEAN' ? (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <Typography sx={{
                                                            color: '#fff',
                                                            fontWeight: 700
                                                        }}>{editValue === 'true' ? 'TRUE' : 'FALSE'}</Typography>
                                                        <Switch checked={editValue === 'true'}
                                                                onChange={(e) => setEditValue(String(e.target.checked))}
                                                                sx={{
                                                                    '& .MuiSwitch-switchBase.Mui-checked': {color: '#6366f1'},
                                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {bgcolor: '#6366f1'}
                                                                }}/>
                                                    </Box>
                                                ) : (
                                                    <TextField fullWidth variant="standard"
                                                               type={type === 'NUMBER' ? 'number' : 'text'}
                                                               value={editValue} autoFocus
                                                               onChange={(e) => setEditValue(e.target.value)}
                                                               onKeyDown={(e) => e.key === 'Enter' && handleUpdate(attr.attributeId)}
                                                               slotProps={{
                                                                   input: {
                                                                       disableUnderline: true,
                                                                       sx: {
                                                                           color: '#fff',
                                                                           fontSize: '1.2rem',
                                                                           fontWeight: 700,
                                                                           '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                                               display: 'none',
                                                                               margin: 0
                                                                           },
                                                                           '& input[type=number]': {
                                                                               MozAppearance: 'textfield'
                                                                           }
                                                                       }
                                                                   }
                                                               }}/>
                                                )
                                            ) : (
                                                <Typography sx={{
                                                    color: '#fff',
                                                    fontSize: '1.2rem',
                                                    fontWeight: 700
                                                }}>{type === 'DATE' ? formatReadableDate(attr.values[0]) : (attr.values.join(', ') || '—')}</Typography>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Stack>
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
                                        mb: 2.5
                                    }}>GRANT NEW ITEM</Typography>
                                    <Stack spacing={2.5}>
                                        <TextField select fullWidth label="ITEM BLUEPRINT"
                                                   value={selectedBlueprint?.id || ''}
                                                   onChange={(e) => handleSelectBlueprint(e.target.value)}
                                                   sx={inputStyles}>
                                            {itemBlueprints.map(bp => <MenuItem key={bp.id} value={bp.id}
                                                                                sx={{fontWeight: 600}}>{bp.name.toUpperCase()}</MenuItem>)}
                                        </TextField>
                                        {selectedBlueprint && (
                                            <>
                                                {selectedBlueprint.attributes?.map(attr => (
                                                    <Box key={attr.id}>
                                                        {attr.valueType === 'BOOLEAN' ? (
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                p: 1
                                                            }}>
                                                                <Typography sx={{
                                                                    color: '#94a3b8',
                                                                    fontWeight: 700
                                                                }}>{attr.name}</Typography>
                                                                <Switch checked={!!grantForm[attr.id]}
                                                                        onChange={(e) => {
                                                                            console.log(`Updating Attribute ID: ${attr.id} with value: ${e.target.value}`);
                                                                            setGrantForm({[attr.id]: e.target.checked})
                                                                        }}/>
                                                            </Box>
                                                        ) : (
                                                            <TextField fullWidth label={attr.name.toUpperCase()}
                                                                       type={attr.valueType === 'NUMBER' ? 'number' : 'text'}
                                                                       value={grantForm[attr.id] || ''}
                                                                       onChange={(e) => setGrantForm({
                                                                           ...grantForm,
                                                                           [attr.id]: e.target.value
                                                                       })} sx={inputStyles}/>
                                                        )}
                                                    </Box>
                                                ))}
                                                <Button fullWidth onClick={handleGrantSubmit} disabled={loading}
                                                        startIcon={<CardGiftcard/>} sx={{
                                                    py: 2,
                                                    borderRadius: '16px',
                                                    fontWeight: 900,
                                                    background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                                                    color: '#fff',
                                                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                                                }}>
                                                    {loading ? 'PROCESSING...' : 'CONFIRM GRANT'}
                                                </Button>
                                            </>
                                        )}
                                    </Stack>
                                </Box>

                                <Box>
                                    <Typography sx={{
                                        color: '#64748b',
                                        fontWeight: 900,
                                        fontSize: '0.8rem',
                                        letterSpacing: 1.5,
                                        mb: 2,
                                        px: 1
                                    }}>CURRENT INVENTORY</Typography>
                                    <List disablePadding>
                                        {inventory.length === 0 && <Typography sx={{
                                            color: 'rgba(255,255,255,0.1)',
                                            textAlign: 'center',
                                            py: 4,
                                            fontWeight: 700
                                        }}>NO ITEMS OWNED</Typography>}
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
        </LocalizationProvider>
    );
};

export default CustomerEditDrawer;