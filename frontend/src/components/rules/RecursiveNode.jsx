import React from 'react';
import {Box} from '@mui/material';
import BuilderPill from './BuilderPill';

export default function RecursiveNode({
                                          node,
                                          allAttributes,
                                          onDrop,
                                          onUpdate,
                                          onDelete,
                                          draggingId,
                                          setDraggingId
                                      }) {
    if (!node) return null;

    const isGroup = node.type === 'group';

    const themeColor = node.operator === 'OR' ? '#f59e0b' : '#6366f1';

    const showLogic = isGroup && node.children?.length > 1;

    if (!isGroup) {
        return (
            <BuilderPill
                item={node}
                allAttributes={allAttributes}
                onDrop={onDrop}
                onDelete={onDelete}
                onUpdate={onUpdate}
                draggingId={draggingId}
                setDraggingId={setDraggingId}
            />
        );
    }

    return (
        <Box sx={{
            position: 'relative',
            pl: showLogic ? '48px' : 0,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {showLogic && (
                <Box
                    onClick={() => onUpdate(node.id, {operator: node.operator === 'AND' ? 'OR' : 'AND'})}
                    sx={{
                        position: 'absolute',
                        left: -14,
                        top: 0,
                        zIndex: 10,
                        cursor: 'pointer',
                        bgcolor: themeColor,
                        color: '#fff',
                        px: 1,
                        py: 0.3,
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        '&:hover': {filter: 'brightness(1.2)'}
                    }}
                >
                    {node.operator}
                </Box>
            )}

            {/* Render Children Recursively */}
            {node.children.map((child, i) => (
                <Box key={child.id} sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    // Vertical Connector Line
                    '&::before': showLogic ? {
                        content: '""',
                        position: 'absolute',
                        left: -48,
                        width: '2px',
                        bgcolor: themeColor,
                        opacity: 0.4,
                        top: i === 0 ? '24px' : 0,
                        bottom: i === node.children.length - 1 ? '50%' : 0
                    } : {},
                    // Horizontal Connector Line
                    '&::after': showLogic ? {
                        content: '""',
                        position: 'absolute',
                        left: -48,
                        top: '50%',
                        width: '48px',
                        height: '2px',
                        bgcolor: themeColor,
                        opacity: 0.4
                    } : {}
                }}>
                    <Box sx={{py: 1.5, width: '100%'}}>
                        <RecursiveNode
                            node={child}
                            allAttributes={allAttributes}
                            onDrop={onDrop}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            draggingId={draggingId}
                            setDraggingId={setDraggingId}
                        />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}