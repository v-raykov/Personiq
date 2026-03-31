import React from 'react';
import {
    Box,
    Button,
    Chip,
    Collapse,
    FormControlLabel,
    IconButton,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import {Add, KeyboardArrowDown} from '@mui/icons-material';
import {DateTimePicker} from '@mui/x-date-pickers';
import {renderTimeViewClock} from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';

export default function FilterManager({
                                          showFilters,
                                          setShowFilters,
                                          filterKey,
                                          setFilterKey,
                                          filterOperator,
                                          setFilterOperator,
                                          filterValue,
                                          setFilterValue,
                                          currentAttrType,
                                          columnNames,
                                          addFilter,
                                          filterBlocks,
                                          onDragStart,
                                          onDropOnBlock,
                                          onDropOnContainer,
                                          removeCondition,
                                          formatValue,
                                          rowsCount,
                                          dragData,
                                          setDropTargetIdx,
                                          dropTargetIdx
                                      }) {
    const inputHeight = '56px';

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 2, px: 1}}>
                <Typography variant="caption"
                            sx={{color: '#94a3b8', fontWeight: 800, letterSpacing: 1.5, fontSize: '0.9rem'}}>
                    {rowsCount} {rowsCount === 1 ? 'RESULT' : 'RESULTS'} DISCOVERED
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" onClick={() => setShowFilters(!showFilters)}
                       sx={{cursor: 'pointer', color: '#6366f1'}}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{letterSpacing: 1}}>
                        {showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}
                    </Typography>
                    <IconButton size="small" sx={{
                        color: 'inherit',
                        transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: '0.3s'
                    }}>
                        <KeyboardArrowDown/>
                    </IconButton>
                </Stack>
            </Stack>

            <Collapse in={showFilters}>
                <Box sx={{mb: 6}}>
                    <Stack direction="row" spacing={2} sx={{mb: 3}}>
                        <Select
                            variant="outlined"
                            value={filterKey}
                            onChange={(e) => setFilterKey(e.target.value)}
                            sx={{
                                color: '#fff',
                                minWidth: 220,
                                borderRadius: '12px',
                                height: inputHeight,
                                bgcolor: 'rgba(255,255,255,0.05)',
                                '& fieldset': {border: '1px solid rgba(255,255,255,0.1)'}
                            }}
                        >
                            <MenuItem value="username">Username</MenuItem>
                            {columnNames.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                        </Select>

                        <Select
                            variant="outlined"
                            value={filterOperator}
                            onChange={(e) => setFilterOperator(e.target.value)}
                            sx={{
                                color: '#fff',
                                minWidth: 180,
                                borderRadius: '12px',
                                height: inputHeight,
                                bgcolor: 'rgba(255,255,255,0.05)',
                                '& fieldset': {border: '1px solid rgba(255,255,255,0.1)'}
                            }}
                        >
                            <MenuItem value="Equal to">Equal to</MenuItem>
                            <MenuItem value="Not equal to">Not equal to</MenuItem>
                            <MenuItem value="Greater than">Greater than</MenuItem>
                            <MenuItem value="Less than">Less than</MenuItem>
                        </Select>

                        <Box sx={{flexGrow: 1}}>
                            {currentAttrType === 'BOOLEAN' ? (
                                <Box sx={{
                                    height: inputHeight,
                                    display: 'flex',
                                    alignItems: 'center',
                                    px: 3,
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <FormControlLabel control={<Switch checked={filterValue === 'true'}
                                                                       onChange={(e) => setFilterValue(String(e.target.checked))}/>}
                                                      label={<Typography
                                                          sx={{color: '#fff'}}>{filterValue === 'true' ? 'True' : 'False'}</Typography>}/>
                                </Box>
                            ) : currentAttrType === 'DATE' ? (
                                <DateTimePicker
                                    value={dayjs(filterValue)}
                                    onChange={(newValue) => setFilterValue(newValue)}
                                    ampm={false}
                                    format="HH:mm DD.MM.YYYY"
                                    viewRenderers={{
                                        hours: renderTimeViewClock,
                                        minutes: renderTimeViewClock,
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            onKeyDown: (e) => e.key === 'Enter' && addFilter(),
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    color: '#fff',
                                                    borderRadius: '12px',
                                                    height: inputHeight,
                                                    bgcolor: 'rgba(255,255,255,0.05)',
                                                    '& fieldset': {border: '1px solid rgba(255,255,255,0.1)'},
                                                    '& .MuiSvgIcon-root': {color: '#818cf8'}
                                                }
                                            }
                                        },
                                        desktopPaper: {
                                            sx: {
                                                bgcolor: '#1e293b',
                                                color: '#fff',
                                                '& .MuiTypography-root': {color: '#fff'},
                                                '& .MuiPickersDay-root': {color: '#fff'},
                                                '& .MuiPickersDay-root.Mui-selected': {bgcolor: '#6366f1 !important'},
                                                '& .MuiClock-pin': {bgcolor: '#6366f1'},
                                                '& .MuiClockPointer-root': {bgcolor: '#6366f1'},
                                                '& .MuiClockPointer-thumb': {
                                                    bgcolor: '#6366f1',
                                                    border: '16px solid #6366f1'
                                                },
                                                '& .MuiClockNumber-root': {color: '#fff'},
                                                '& .MuiButtonBase-root': {color: '#818cf8'}
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <TextField
                                    type={currentAttrType === 'NUMBER' ? 'number' : 'text'}
                                    placeholder="Value..."
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addFilter()}
                                    sx={{
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            borderRadius: '12px',
                                            height: inputHeight,
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            '& fieldset': {border: '1px solid rgba(255,255,255,0.1)'}
                                        },
                                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                            display: 'none',
                                            margin: 0
                                        },
                                        '& input[type=number]': {MozAppearance: 'textfield'}
                                    }}
                                />
                            )}
                        </Box>

                        <Button variant="contained" onClick={addFilter} startIcon={<Add/>} sx={{
                            borderRadius: '12px',
                            px: 4,
                            fontWeight: 800,
                            background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)'
                        }}>Add Filter</Button>
                    </Stack>

                    {filterBlocks.length > 0 && (
                        <Box
                            id="filter-container" onDragOver={(e) => e.preventDefault()} onDrop={onDropOnContainer}
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2,
                                alignItems: 'center',
                                minHeight: '80px',
                                p: 3,
                                borderRadius: '24px',
                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                        >
                            {filterBlocks.map((block, bIdx) => (
                                <React.Fragment key={bIdx}>
                                    <Box
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            if (dragData?.blockIdx !== bIdx) setDropTargetIdx(bIdx);
                                        }}
                                        onDragLeave={() => setDropTargetIdx(null)}
                                        onDrop={(e) => onDropOnBlock(e, bIdx)}
                                        sx={{
                                            display: 'flex',
                                            gap: 2,
                                            alignItems: 'center',
                                            transition: '0.2s',
                                            p: 1,
                                            borderRadius: '12px',
                                            bgcolor: dropTargetIdx === bIdx ? 'rgba(99, 102, 241, 0.15)' : 'transparent'
                                        }}
                                    >
                                        {block.map((cond, cIdx) => (
                                            <React.Fragment key={cond.id}>
                                                <Chip
                                                    draggable onDragStart={(e) => onDragStart(e, bIdx, cIdx)}
                                                    onDragEnd={() => {
                                                        setDropTargetIdx(null);
                                                    }}
                                                    label={`${cond.key} ${cond.operator.toLowerCase()} ${cond.type === 'DATE' ? formatValue(cond.value, 'DATE') : cond.value}`}
                                                    onDelete={() => removeCondition(bIdx, cond.id)}
                                                    sx={{
                                                        bgcolor: 'rgba(129, 140, 248, 0.15)',
                                                        color: '#818cf8',
                                                        fontWeight: 900,
                                                        borderRadius: '10px',
                                                        height: 42,
                                                        fontSize: '1.1rem',
                                                        border: '1px solid rgba(129, 140, 248, 0.2)'
                                                    }}
                                                />
                                                {cIdx < block.length - 1 && <Typography sx={{
                                                    color: '#6366f1',
                                                    fontWeight: 900,
                                                    fontSize: '0.9rem'
                                                }}>AND</Typography>}
                                            </React.Fragment>
                                        ))}
                                    </Box>
                                    {bIdx < filterBlocks.length - 1 && <Typography
                                        sx={{color: '#94a3b8', fontWeight: 900, fontSize: '1.1rem'}}>OR</Typography>}
                                </React.Fragment>
                            ))}
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};