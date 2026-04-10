import React, {useCallback, useMemo, useState} from 'react';
import {
    Box,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';

import {useParams} from "react-router-dom";
import {useCustomerData} from '@/hooks/useCustomerData.js';
import AttributeDrawer from '@/components/customers/UpdateDrawer.jsx';
import FilterManager from '@/components/customers/FilterManager.jsx';

export default function CustomerAttributesValues() {
    const {tenantUri} = useParams();
    const {customers, attributeData, schema, loading, refresh} = useCustomerData(tenantUri);

    const [sortConfig, setSortConfig] = useState({key: 'username', direction: 'asc'});
    const [filterBlocks, setFilterBlocks] = useState([]);
    const [filterKey, setFilterKey] = useState('username');
    const [filterOperator, setFilterOperator] = useState('Equal to');
    const [filterValue, setFilterValue] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [dragData, setDragData] = useState(null);
    const [dropTargetIdx, setDropTargetIdx] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const currentAttrType = useMemo(() => {
        if (filterKey === 'username') return 'STRING';
        return schema.find(a => a.name === filterKey)?.valueType || 'STRING';
    }, [filterKey, schema]);

    const handleFilterKeyChange = (newKey) => {
        setFilterKey(newKey);
        const newType = newKey === 'username' ? 'STRING' : schema.find(a => a.name === newKey)?.valueType || 'STRING';
        if (newType === 'DATE') setFilterValue(dayjs().toISOString());
        else if (newType === 'BOOLEAN') setFilterValue('false');
        else setFilterValue('');
    };

    const formatValue = useCallback((val, type) => {
        if (!val || val === '-') return '-';
        if (type === 'DATE') {
            const dateArr = Array.isArray(val) ? val : [val];
            return dateArr.map(d => dayjs(d).isValid() ? dayjs(d).format('HH:mm DD.MM.YYYY') : d).join(', ');
        }
        return Array.isArray(val) ? val.join(', ') : val;
    }, []);

    const {columnNames, rows} = useMemo(() => {
        const names = new Set();
        const preparedRows = customers.map(cust => {
            const attrs = attributeData[cust.customerId] || [];
            const attrMap = {};
            attrs.forEach(a => {
                names.add(a.name);
                attrMap[a.name] = a.values.length > 1 ? a.values : a.values[0];
            });
            return {username: cust.username, ...attrMap, customerId: cust.customerId};
        });

        const filteredRows = preparedRows.filter(row => {
            if (filterBlocks.length === 0) return true;
            return filterBlocks.some(block =>
                block.every(cond => {
                    if (!cond) return false;
                    let v1 = row[cond.key] ?? '', v2 = cond.value;
                    if (cond.type === 'NUMBER') {
                        v1 = Number(v1);
                        v2 = Number(v2);
                    } else if (cond.type === 'DATE') {
                        v1 = dayjs(v1).valueOf();
                        v2 = dayjs(v2).valueOf();
                    } else {
                        v1 = String(v1).toLowerCase();
                        v2 = String(v2).toLowerCase();
                    }
                    switch (cond.operator) {
                        case 'Equal to':
                            return v1 === v2;
                        case 'Not equal to':
                            return v1 !== v2;
                        case 'Greater than':
                            return v1 > v2;
                        case 'Less than':
                            return v1 < v2;
                        default:
                            return true;
                    }
                })
            );
        });

        return {
            columnNames: Array.from(names).sort(),
            rows: [...filteredRows].sort((a, b) => {
                const valA = a[sortConfig.key] || '', valB = b[sortConfig.key] || '';
                return sortConfig.direction === 'asc' ? (valA < valB ? -1 : 1) : (valA < valB ? 1 : -1);
            })
        };
    }, [customers, attributeData, filterBlocks, sortConfig]);

    const addFilter = () => {
        let val = filterValue;
        if (currentAttrType === 'DATE') {
            if (!dayjs(val).isValid()) return;
            val = dayjs(val).toISOString();
        }
        if (val === '' && currentAttrType !== 'BOOLEAN') return;
        setFilterBlocks([...filterBlocks, [{
            key: filterKey,
            operator: filterOperator,
            value: val,
            type: currentAttrType,
            id: `cond-${Date.now()}`
        }]]);
    };

    const handleDnd = (targetIdx) => {
        if (!dragData || dragData.blockIdx === targetIdx) return;
        const blocks = filterBlocks.map(b => [...b]);
        const [moved] = blocks[dragData.blockIdx].splice(dragData.condIdx, 1);

        if (moved) {
            blocks[targetIdx].push(moved);
            setFilterBlocks(blocks.filter(b => b.length > 0));
        }
        setDragData(null);
        setDropTargetIdx(null);
    };

    return (
        <Box sx={{width: '100%', p: 2}}>
            <FilterManager
                showFilters={showFilters} setShowFilters={setShowFilters}
                filterKey={filterKey} setFilterKey={handleFilterKeyChange}
                filterOperator={filterOperator} setFilterOperator={setFilterOperator}
                filterValue={filterValue} setFilterValue={setFilterValue}
                currentAttrType={currentAttrType} columnNames={columnNames}
                addFilter={addFilter} filterBlocks={filterBlocks}
                formatValue={formatValue} rowsCount={rows.length}
                dragData={dragData} dropTargetIdx={dropTargetIdx} setDropTargetIdx={setDropTargetIdx}
                onDragStart={(e, b, c) => {
                    setDragData({blockIdx: b, condIdx: c});
                    e.dataTransfer.effectAllowed = "move";
                }}
                onDropOnBlock={(e, idx) => handleDnd(idx)}
                onDropOnContainer={() => {
                    if (!dragData) return;
                    const blocks = filterBlocks.map(b => [...b]);
                    if (blocks[dragData.blockIdx].length === 1) return;
                    const [moved] = blocks[dragData.blockIdx].splice(dragData.condIdx, 1);
                    if (moved) {
                        setFilterBlocks([...blocks.filter(b => b.length > 0), [moved]]);
                    }
                    setDragData(null);
                }}
                removeCondition={(bIdx, id) => setFilterBlocks(filterBlocks.map((b, i) => i === bIdx ? b.filter(c => c.id !== id) : b).filter(g => g.length > 0))}
            />

            {loading && <LinearProgress
                sx={{height: 3, mb: 1, bgcolor: 'transparent', '& .MuiLinearProgress-bar': {bgcolor: '#6366f1'}}}/>}

            <TableContainer component={Paper} sx={{
                width: '100%',
                borderRadius: '24px',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: 'none',
                overflow: 'hidden'
            }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{bgcolor: 'rgba(255,255,255,0.02)'}}>
                            <TableCell sx={{color: '#94a3b8', fontWeight: 800, py: 2.5, pl: 4}}>
                                <TableSortLabel active={sortConfig.key === 'username'}
                                                direction={sortConfig.direction} onClick={() => setSortConfig({
                                    key: 'username',
                                    direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                                })} sx={{color: 'inherit !important'}}>USERNAME</TableSortLabel>
                            </TableCell>
                            {columnNames.map(name => (
                                <TableCell key={name} sx={{color: '#94a3b8', fontWeight: 800, py: 2.5}}>
                                    <TableSortLabel active={sortConfig.key === name}
                                                    direction={sortConfig.direction} onClick={() => setSortConfig({
                                        key: name,
                                        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                                    })} sx={{color: 'inherit !important'}}>{name.toUpperCase()}</TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.customerId} onClick={() => setSelectedCustomer(row)}
                                      sx={{cursor: 'pointer', '&:hover': {bgcolor: 'rgba(255,255,255,0.05)'}}}>
                                <TableCell sx={{
                                    py: 2.5,
                                    pl: 4,
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '1.1rem'
                                }}>{row.username}</TableCell>
                                {columnNames.map(name => (
                                    <TableCell key={name} sx={{color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem'}}>
                                        {formatValue(row[name], schema.find(s => s.name === name)?.valueType || 'STRING')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <AttributeDrawer open={Boolean(selectedCustomer)} customer={selectedCustomer} tenantUri={tenantUri}
                             attributes={attributeData} onClose={() => setSelectedCustomer(null)}
                             onRefresh={refresh}/>
        </Box>
    );
};