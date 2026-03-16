import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TextField, Box, Typography, TableSortLabel,
    MenuItem, Select, Button, Chip, Stack, LinearProgress,
    Collapse, IconButton
} from '@mui/material';
import { Add, KeyboardArrowDown } from '@mui/icons-material';
import { getCustomers, getBulkAttributes } from '../api';
import { useParams } from "react-router-dom";
import AttributeDrawer from '../components/AttributeDrawer';

const CustomerAttributesValues = () => {
    const { tenantUri } = useParams();
    const [customers, setCustomers] = useState([]);
    const [attributeData, setAttributeData] = useState({});
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });

    const [filterBlocks, setFilterBlocks] = useState([]);
    const [filterKey, setFilterKey] = useState('username');
    const [filterValue, setFilterValue] = useState('');

    // 1. CHANGED: Hidden by default
    const [showFilters, setShowFilters] = useState(false);

    const [dragData, setDragData] = useState(null);
    const [dropTargetIdx, setDropTargetIdx] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const inputHeight = '56px';

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: customerList } = await getCustomers(tenantUri);
            setCustomers(customerList);
            const ids = customerList.map(c => c.customerId);
            if (ids.length > 0) {
                const { data: attrMap } = await getBulkAttributes(tenantUri, ids);
                setAttributeData(attrMap);
            }
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        } finally {
            setLoading(false);
        }
    }, [tenantUri]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addFilter = () => {
        if (!filterValue.trim()) return;
        const newCond = { key: filterKey, value: filterValue, id: `cond-${Date.now()}` };
        setFilterBlocks([...filterBlocks, [newCond]]);
        setFilterValue('');
    };

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

    const { columnNames, rows } = useMemo(() => {
        const names = new Set();
        const preparedRows = customers.map(cust => {
            const attrs = attributeData[cust.customerId] || [];
            const attrMap = {};
            attrs.forEach(a => { names.add(a.name); attrMap[a.name] = a.values.join(', '); });
            return { username: cust.username, ...attrMap, customerId: cust.customerId };
        });

        const filteredRows = preparedRows.filter(row => {
            if (filterBlocks.length === 0) return true;
            return filterBlocks.some(block =>
                block.every(cond => {
                    const rowVal = row[cond.key] ? String(row[cond.key]).toLowerCase() : '';
                    return rowVal.includes(cond.value.toLowerCase());
                })
            );
        });

        const sortedRows = [...filteredRows].sort((a, b) => {
            const valA = a[sortConfig.key] || '';
            const valB = b[sortConfig.key] || '';
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            return sortConfig.direction === 'asc' ? 1 : -1;
        });

        return { columnNames: Array.from(names).sort(), rows: sortedRows };
    }, [customers, attributeData, filterBlocks, sortConfig]);

    return (
        <Box sx={{ width: '100%' }}>

            {/* 2. RESTRUCTURED: Results and Toggle on the same line */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2, px: 1 }}
            >
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, letterSpacing: 1.5, fontSize: '0.9rem' }}>
                    {rows.length} {rows.length === 1 ? 'RESULT' : 'RESULTS'} DISCOVERED
                </Typography>

                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ cursor: 'pointer', userSelect: 'none', color: '#6366f1' }}
                >
                    <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: 1 }}>
                        {showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}
                    </Typography>
                    <IconButton size="small" sx={{
                        color: 'inherit',
                        transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: '0.3s'
                    }}>
                        <KeyboardArrowDown />
                    </IconButton>
                </Stack>
            </Stack>

            <Collapse in={showFilters}>
                <Box sx={{ mb: 6 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'stretch' }}>
                        <Select
                            value={filterKey}
                            onChange={(e) => setFilterKey(e.target.value)}
                            sx={{
                                color: '#fff', minWidth: 220, borderRadius: '12px',
                                fontSize: '1.2rem', height: inputHeight,
                                bgcolor: 'rgba(255,255,255,0.05)',
                                '& fieldset': { border: '1px solid rgba(255,255,255,0.1)' }
                            }}
                        >
                            <MenuItem value="username" sx={{ fontSize: '1.1rem' }}>Username</MenuItem>
                            {columnNames.map(n => <MenuItem key={n} value={n} sx={{ fontSize: '1.1rem' }}>{n}</MenuItem>)}
                        </Select>

                        <TextField
                            placeholder="Enter filter value..." value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addFilter()}
                            sx={{
                                minWidth: 350,
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff', borderRadius: '12px', fontSize: '1.2rem',
                                    height: inputHeight,
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    '& fieldset': { border: '1px solid rgba(255,255,255,0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                    '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                                }
                            }}
                        />

                        <Button
                            variant="contained" onClick={addFilter}
                            startIcon={<Add />}
                            sx={{
                                borderRadius: '12px', fontWeight: 800, px: 4,
                                fontSize: '1.1rem', height: inputHeight,
                                background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                                textTransform: 'none'
                            }}
                        >
                            Add Filter
                        </Button>
                    </Stack>

                    {filterBlocks.length > 0 && (
                        <Box
                            id="filter-container"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onDropOnContainer}
                            sx={{
                                display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', minHeight: '80px',
                                p: 3, borderRadius: '24px', bgcolor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                        >
                            {filterBlocks.map((block, bIdx) => (
                                <React.Fragment key={bIdx}>
                                    <Box
                                        onDragOver={(e) => { e.preventDefault(); if(dragData?.blockIdx !== bIdx) setDropTargetIdx(bIdx); }}
                                        onDragLeave={() => setDropTargetIdx(null)}
                                        onDrop={(e) => onDropOnBlock(e, bIdx)}
                                        sx={{
                                            display: 'flex', gap: 2, alignItems: 'center',
                                            transition: 'all 0.2s', p: 1, borderRadius: '12px',
                                            bgcolor: dropTargetIdx === bIdx ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                        }}
                                    >
                                        {block.map((cond, cIdx) => (
                                            <React.Fragment key={cond.id}>
                                                <Chip
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, bIdx, cIdx)}
                                                    onDragEnd={() => { setDragData(null); setDropTargetIdx(null); }}
                                                    label={`${cond.key}: ${cond.value}`}
                                                    onDelete={() => removeCondition(bIdx, cond.id)}
                                                    sx={{
                                                        bgcolor: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontWeight: 900,
                                                        borderRadius: '10px', cursor: 'grab', height: 42, fontSize: '1.1rem',
                                                        border: '1px solid rgba(129, 140, 248, 0.2)',
                                                        '& .MuiChip-deleteIcon': { fontSize: '22px', color: '#818cf8' }
                                                    }}
                                                />
                                                {cIdx < block.length - 1 && (
                                                    <Typography sx={{ color: '#6366f1', fontWeight: 900, fontSize: '0.9rem' }}>AND</Typography>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </Box>
                                    {bIdx < filterBlocks.length - 1 && (
                                        <Typography sx={{ color: '#94a3b8', fontWeight: 900, fontSize: '1.1rem', mx: 0.5 }}>OR</Typography>
                                    )}
                                </React.Fragment>
                            ))}
                        </Box>
                    )}
                </Box>
            </Collapse>

            {loading && <LinearProgress sx={{ height: 3, mb: 1, bgcolor: 'transparent', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }} />}

            <TableContainer
                component={Paper}
                sx={{
                    width: '100%', borderRadius: '24px', bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: 'none', overflow: 'hidden'
                }}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 800, py: 2.5, pl: 4, borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.95rem' }}>
                                <TableSortLabel active={sortConfig.key === 'username'} direction={sortConfig.direction} onClick={() => setSortConfig({ key: 'username', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })} sx={{ color: 'inherit !important' }}>USERNAME</TableSortLabel>
                            </TableCell>
                            {columnNames.map(name => (
                                <TableCell key={name} sx={{ color: '#94a3b8', fontWeight: 800, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.95rem' }}>
                                    <TableSortLabel active={sortConfig.key === name} direction={sortConfig.direction} onClick={() => setSortConfig({ key: name, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })} sx={{ color: 'inherit !important' }}>{name.toUpperCase()}</TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow
                                key={row.customerId}
                                onClick={() => setSelectedCustomer(row)}
                                sx={{
                                    cursor: 'pointer',
                                    transition: '0.1s',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                                    '&:last-child td': { border: 0 }
                                }}
                            >
                                <TableCell sx={{ py: 2.5, pl: 4, borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                                    {row.username}
                                </TableCell>
                                {columnNames.map(name => (
                                    <TableCell key={name} sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>
                                        {row[name] || '-'}
                                    </TableCell>
                                ))}
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
    );
};

export default CustomerAttributesValues;