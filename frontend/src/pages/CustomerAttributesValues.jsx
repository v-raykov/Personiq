import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TextField, Box, Typography, TableSortLabel,
    MenuItem, Select, Button, Chip, Stack, LinearProgress,
    Collapse, IconButton, Switch, FormControlLabel
} from '@mui/material';
import { Add, KeyboardArrowDown } from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';

import { getCustomers, getBulkAttributes, getCustomerAttributes } from '../api';
import { useParams } from "react-router-dom";
import AttributeDrawer from '../components/AttributeDrawer';

const CustomerAttributesValues = () => {
    const { tenantUri } = useParams();
    const [customers, setCustomers] = useState([]);
    const [attributeData, setAttributeData] = useState({});
    const [schema, setSchema] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });

    const [filterBlocks, setFilterBlocks] = useState([]);
    const [filterKey, setFilterKey] = useState('username');
    const [filterOperator, setFilterOperator] = useState('Equal to');
    const [filterValue, setFilterValue] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [dragData, setDragData] = useState(null);
    const [dropTargetIdx, setDropTargetIdx] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const inputHeight = '56px';

    const currentAttrType = useMemo(() => {
        if (filterKey === 'username') return 'STRING';
        return schema.find(a => a.name === filterKey)?.valueType || 'STRING';
    }, [filterKey, schema]);

    useEffect(() => {
        if (currentAttrType === 'DATE') {
            setFilterValue(dayjs());
        } else if (currentAttrType === 'BOOLEAN') {
            setFilterValue('false');
        } else {
            setFilterValue('');
        }
    }, [filterKey, currentAttrType]);

    const formatValue = useCallback((val, type) => {
        if (!val || val === '-') return '-';
        if (type === 'DATE') {
            const dateArr = Array.isArray(val) ? val : [val];
            return dateArr.map(d => {
                const date = dayjs(d);
                return date.isValid() ? date.format('HH:mm DD.MM.YYYY') : d;
            }).join(', ');
        }
        return Array.isArray(val) ? val.join(', ') : val;
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [custRes, schemaRes] = await Promise.all([
                getCustomers(tenantUri),
                getCustomerAttributes(tenantUri)
            ]);
            setCustomers(custRes.data);
            setSchema(schemaRes.data || []);
            const ids = custRes.data.map(c => c.customerId);
            if (ids.length > 0) {
                const { data: attrMap } = await getBulkAttributes(tenantUri, ids);
                setAttributeData(attrMap);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [tenantUri]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const addFilter = () => {
        let finalVal = filterValue;
        if (currentAttrType === 'DATE') {
            const dateObj = dayjs(filterValue);
            if (!dateObj.isValid()) return;
            finalVal = dateObj.toISOString();
        }
        if (finalVal === '' && currentAttrType !== 'BOOLEAN') return;

        const newCond = {
            key: filterKey,
            operator: filterOperator,
            value: finalVal,
            type: currentAttrType,
            id: `cond-${Date.now()}`
        };
        setFilterBlocks([...filterBlocks, [newCond]]);

        if (currentAttrType === 'DATE') setFilterValue(dayjs());
        else if (currentAttrType === 'BOOLEAN') setFilterValue('false');
        else setFilterValue('');
    };

    const { columnNames, rows } = useMemo(() => {
        const names = new Set();
        const preparedRows = customers.map(cust => {
            const attrs = attributeData[cust.customerId] || [];
            const attrMap = {};
            attrs.forEach(a => {
                names.add(a.name);
                attrMap[a.name] = a.values.length > 1 ? a.values : a.values[0];
            });
            return { username: cust.username, ...attrMap, customerId: cust.customerId };
        });

        const filteredRows = preparedRows.filter(row => {
            if (filterBlocks.length === 0) return true;
            return filterBlocks.some(block =>
                block.every(cond => {
                    const rowVal = row[cond.key] ?? '';
                    const fVal = cond.value;
                    let v1 = rowVal;
                    let v2 = fVal;
                    if (cond.type === 'NUMBER') {
                        v1 = Number(rowVal);
                        v2 = Number(fVal);
                    } else if (cond.type === 'DATE') {
                        v1 = dayjs(rowVal).valueOf();
                        v2 = dayjs(fVal).valueOf();
                    } else {
                        v1 = String(rowVal).toLowerCase();
                        v2 = String(fVal).toLowerCase();
                    }
                    switch (cond.operator) {
                        case 'Equal to': return v1 === v2;
                        case 'Not equal to': return v1 !== v2;
                        case 'Greater than': return v1 > v2;
                        case 'Less than': return v1 < v2;
                        default: return true;
                    }
                })
            );
        });

        return {
            columnNames: Array.from(names).sort(),
            rows: [...filteredRows].sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                return sortConfig.direction === 'asc' ? (valA < valB ? -1 : 1) : (valA < valB ? 1 : -1);
            })
        };
    }, [customers, attributeData, filterBlocks, sortConfig]);

    const onDragStart = (e, blockIdx, condIdx) => {
        setDragData({ blockIdx, condIdx });
        e.dataTransfer.effectAllowed = "move";
    };

    const onDropOnBlock = (e, targetBlockIdx) => {
        e.preventDefault();
        setDropTargetIdx(null);
        if (!dragData) return;
        const { blockIdx: sBlockIdx, condIdx: sCondIdx } = dragData;
        if (sBlockIdx === targetBlockIdx) return;
        const blocks = [...filterBlocks];
        const movedCondition = blocks[sBlockIdx][sCondIdx];
        blocks[targetBlockIdx] = [...blocks[targetBlockIdx], movedCondition];
        blocks[sBlockIdx].splice(sCondIdx, 1);
        setFilterBlocks(blocks.filter(b => b.length > 0));
        setDragData(null);
    };

    const onDropOnContainer = (e) => {
        if (e.target.id !== "filter-container") return;
        if (!dragData) return;
        const { blockIdx, condIdx } = dragData;
        const blocks = [...filterBlocks];
        if (blocks[blockIdx].length === 1) return;
        const movedCondition = blocks[blockIdx][condIdx];
        blocks[blockIdx].splice(condIdx, 1);
        setFilterBlocks([...blocks.filter(b => b.length > 0), [movedCondition]]);
        setDragData(null);
        setDropTargetIdx(null);
    };

    const removeCondition = (blockIdx, condId) => {
        const updated = filterBlocks.map((block, i) =>
            i === blockIdx ? block.filter(c => c.id !== condId) : block
        ).filter(group => group.length > 0);
        setFilterBlocks(updated);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <Box sx={{ width: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, px: 1 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, letterSpacing: 1.5, fontSize: '0.9rem' }}>
                        {rows.length} {rows.length === 1 ? 'RESULT' : 'RESULTS'} DISCOVERED
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" onClick={() => setShowFilters(!showFilters)} sx={{ cursor: 'pointer', color: '#6366f1' }}>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: 1 }}>{showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}</Typography>
                        <IconButton size="small" sx={{ color: 'inherit', transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
                            <KeyboardArrowDown />
                        </IconButton>
                    </Stack>
                </Stack>

                <Collapse in={showFilters}>
                    <Box sx={{ mb: 6 }}>
                        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                            <Select
                                value={filterKey}
                                onChange={(e) => setFilterKey(e.target.value)}
                                sx={{ color: '#fff', minWidth: 220, borderRadius: '12px', height: inputHeight, bgcolor: 'rgba(255,255,255,0.05)', '& fieldset': { border: '1px solid rgba(255,255,255,0.1)' } }}
                            >
                                <MenuItem value="username">Username</MenuItem>
                                {columnNames.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                            </Select>

                            <Select
                                value={filterOperator}
                                onChange={(e) => setFilterOperator(e.target.value)}
                                sx={{ color: '#fff', minWidth: 180, borderRadius: '12px', height: inputHeight, bgcolor: 'rgba(255,255,255,0.05)', '& fieldset': { border: '1px solid rgba(255,255,255,0.1)' } }}
                            >
                                <MenuItem value="Equal to">Equal to</MenuItem>
                                <MenuItem value="Not equal to">Not equal to</MenuItem>
                                <MenuItem value="Greater than">Greater than</MenuItem>
                                <MenuItem value="Less than">Less than</MenuItem>
                            </Select>

                            <Box sx={{ flexGrow: 1 }}>
                                {currentAttrType === 'BOOLEAN' ? (
                                    <Box sx={{ height: inputHeight, display: 'flex', alignItems: 'center', px: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <FormControlLabel control={<Switch checked={filterValue === 'true'} onChange={(e) => setFilterValue(String(e.target.checked))} />} label={<Typography sx={{ color: '#fff' }}>{filterValue === 'true' ? 'True' : 'False'}</Typography>} />
                                    </Box>
                                ) : currentAttrType === 'DATE' ? (
                                    <DateTimePicker
                                        value={dayjs(filterValue)}
                                        onChange={(newValue) => setFilterValue(newValue)}
                                        ampm={false}
                                        viewRenderers={{
                                            hours: renderTimeViewClock,
                                            minutes: renderTimeViewClock,
                                        }}
                                        format="HH:mm DD.MM.YYYY"
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        color: '#fff', borderRadius: '12px', height: inputHeight, bgcolor: 'rgba(255,255,255,0.05)',
                                                        '& fieldset': { border: '1px solid rgba(255,255,255,0.1)' },
                                                        '& .MuiSvgIcon-root': { color: '#818cf8' }
                                                    }
                                                }
                                            },
                                            desktopPaper: {
                                                sx: {
                                                    bgcolor: '#1e293b',
                                                    color: '#fff',
                                                    '& .MuiTypography-root': { color: '#fff' },
                                                    '& .MuiPickersDay-root': { color: '#fff' },
                                                    '& .MuiPickersDay-root.Mui-selected': { bgcolor: '#6366f1 !important' },
                                                    '& .MuiClock-pin': { bgcolor: '#6366f1' },
                                                    '& .MuiClockPointer-root': { bgcolor: '#6366f1' },
                                                    '& .MuiClockPointer-thumb': { bgcolor: '#6366f1', border: '16px solid #6366f1' },
                                                    '& .MuiClockNumber-root': { color: '#fff' }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <TextField
                                        type={currentAttrType === 'NUMBER' ? 'number' : 'text'}
                                        placeholder="Value..." value={filterValue} onChange={(e) => setFilterValue(e.target.value)}
                                        sx={{
                                            width: '100%',
                                            '& .MuiOutlinedInput-root': {
                                                color: '#fff', borderRadius: '12px', height: inputHeight, bgcolor: 'rgba(255,255,255,0.05)',
                                                '& fieldset': { border: '1px solid rgba(255,255,255,0.1)' }
                                            }
                                        }}
                                    />
                                )}
                            </Box>

                            <Button variant="contained" onClick={addFilter} startIcon={<Add />} sx={{ borderRadius: '12px', px: 4, fontWeight: 800, background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)' }}>Add Filter</Button>
                        </Stack>

                        {filterBlocks.length > 0 && (
                            <Box
                                id="filter-container" onDragOver={(e) => e.preventDefault()} onDrop={onDropOnContainer}
                                sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', minHeight: '80px', p: 3, borderRadius: '24px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                            >
                                {filterBlocks.map((block, bIdx) => (
                                    <React.Fragment key={bIdx}>
                                        <Box
                                            onDragOver={(e) => { e.preventDefault(); if(dragData?.blockIdx !== bIdx) setDropTargetIdx(bIdx); }}
                                            onDragLeave={() => setDropTargetIdx(null)} onDrop={(e) => onDropOnBlock(e, bIdx)}
                                            sx={{ display: 'flex', gap: 2, alignItems: 'center', transition: '0.2s', p: 1, borderRadius: '12px', bgcolor: dropTargetIdx === bIdx ? 'rgba(99, 102, 241, 0.15)' : 'transparent' }}
                                        >
                                            {block.map((cond, cIdx) => (
                                                <React.Fragment key={cond.id}>
                                                    <Chip
                                                        draggable onDragStart={(e) => onDragStart(e, bIdx, cIdx)} onDragEnd={() => { setDragData(null); setDropTargetIdx(null); }}
                                                        label={`${cond.key} ${cond.operator.toLowerCase()} ${cond.type === 'DATE' ? formatValue(cond.value, 'DATE') : cond.value}`} onDelete={() => removeCondition(bIdx, cond.id)}
                                                        sx={{ bgcolor: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontWeight: 900, borderRadius: '10px', height: 42, fontSize: '1.1rem', border: '1px solid rgba(129, 140, 248, 0.2)' }}
                                                    />
                                                    {cIdx < block.length - 1 && <Typography sx={{ color: '#6366f1', fontWeight: 900, fontSize: '0.9rem' }}>AND</Typography>}
                                                </React.Fragment>
                                            ))}
                                        </Box>
                                        {bIdx < filterBlocks.length - 1 && <Typography sx={{ color: '#94a3b8', fontWeight: 900, fontSize: '1.1rem' }}>OR</Typography>}
                                    </React.Fragment>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Collapse>

                {loading && <LinearProgress sx={{ height: 3, mb: 1, bgcolor: 'transparent', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }} />}

                <TableContainer component={Paper} sx={{ width: '100%', borderRadius: '24px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: 'none', overflow: 'hidden' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 800, py: 2.5, pl: 4, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <TableSortLabel active={sortConfig.key === 'username'} direction={sortConfig.direction} onClick={() => setSortConfig({ key: 'username', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })} sx={{ color: 'inherit !important' }}>USERNAME</TableSortLabel>
                                </TableCell>
                                {columnNames.map(name => (
                                    <TableCell key={name} sx={{ color: '#94a3b8', fontWeight: 800, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                        <TableSortLabel active={sortConfig.key === name} direction={sortConfig.direction} onClick={() => setSortConfig({ key: name, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })} sx={{ color: 'inherit !important' }}>{name.toUpperCase()}</TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.customerId} onClick={() => setSelectedCustomer(row)} sx={{ cursor: 'pointer', transition: '0.1s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '&:last-child td': { border: 0 } }}>
                                    <TableCell sx={{ py: 2.5, pl: 4, borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{row.username}</TableCell>
                                    {columnNames.map(name => {
                                        const type = schema.find(s => s.name === name)?.valueType || 'STRING';
                                        return (
                                            <TableCell key={name} sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>
                                                {formatValue(row[name], type)}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <AttributeDrawer
                    open={Boolean(selectedCustomer)}
                    customer={selectedCustomer}
                    tenantUri={tenantUri}
                    attributes={attributeData}
                    onClose={() => setSelectedCustomer(null)}
                    onRefresh={fetchData}
                />
            </Box>
        </LocalizationProvider>
    );
};

export default CustomerAttributesValues;