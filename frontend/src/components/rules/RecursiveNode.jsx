import React from 'react';
import { Box } from '@mui/material';
import BuilderPill from './BuilderPill';

export default function RecursiveNode({ node, onDrop, onUpdate, onDelete, draggingId, setDraggingId }) {
    if (!node) return null;
    const isGroup = node.type === 'group';
    const themeColor = node.operator === 'OR' ? '#f59e0b' : '#6366f1';
    const showLogic = isGroup && node.children?.length > 1;

    if (!isGroup) return (
        <BuilderPill
            item={node} onDrop={onDrop} onDelete={onDelete}
            onUpdate={onUpdate} draggingId={draggingId} setDraggingId={setDraggingId}
        />
    );

    return (
        <Box sx={{ position: 'relative', pl: showLogic ? '48px' : 0, display: 'flex', flexDirection: 'column' }}>
            {showLogic && (
                <Box
                    onClick={() => onUpdate(node.id, { operator: node.operator === 'AND' ? 'OR' : 'AND' })}
                    sx={{ position: 'absolute', left: -14, top: 0, zIndex: 10, cursor: 'pointer', bgcolor: themeColor, color: '#fff', px: 1, py: 0.3, borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}
                >
                    {node.operator}
                </Box>
            )}
            {node.children.map((child, i) => (
                <Box key={child.id} sx={{
                    position: 'relative', display: 'flex', alignItems: 'center',
                    '&::before': showLogic ? {
                        content: '""', position: 'absolute', left: -48, width: '2px', bgcolor: themeColor, opacity: 0.4,
                        top: i === 0 ? '12px' : 0, bottom: i === node.children.length - 1 ? '50%' : 0
                    } : {},
                    '&::after': showLogic ? {
                        content: '""', position: 'absolute', left: -48, top: '50%', width: '48px', height: '2px', bgcolor: themeColor, opacity: 0.4
                    } : {}
                }}>
                    <Box sx={{ py: 1.5 }}>
                        <RecursiveNode
                            node={child} onDrop={onDrop} onUpdate={onUpdate}
                            onDelete={onDelete} draggingId={draggingId} setDraggingId={setDraggingId}
                        />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}