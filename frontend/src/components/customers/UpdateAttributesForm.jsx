import React from 'react';
import {IconButton, Stack, Tooltip} from "@mui/material";
import {Edit, RestartAlt, Save} from '@mui/icons-material';
import AttributeField from '@/components/shared/AttributeField.jsx';

export default function UpdateAttributesForm({
                                                 customerAttrs,
                                                 schema,
                                                 editingId,
                                                 editValue,
                                                 setEditingId,
                                                 setEditValue,
                                                 handleUpdate,
                                                 handleReset,
                                                 loading
                                             }) {
    return (
        <Stack spacing={2.5}>
            {customerAttrs.map((attr) => {
                const schemaDef = schema.find(s => s.name === attr.name);
                const vType = schemaDef?.valueType || 'STRING';
                const isList = schemaDef?.isList || false;
                const isEditing = editingId === attr.attributeId;

                return (
                    <AttributeField
                        key={attr.attributeId}
                        // Use the raw name from backend (usually lowercase/camelCase)
                        label={attr.name}
                        vType={vType}
                        isList={isList}
                        value={isEditing ? editValue : (attr.values.join(', ') || '')}
                        onChange={(val) => isEditing ? setEditValue(val) : null}
                        endAdornment={
                            <Stack direction="row" spacing={0.5}>
                                {isEditing ? (
                                    <IconButton
                                        size="small"
                                        onClick={() => handleUpdate(attr.attributeId)}
                                        sx={{color: '#10b981'}}
                                        disabled={loading}
                                    >
                                        <Save fontSize="small"/>
                                    </IconButton>
                                ) : (
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setEditingId(attr.attributeId);
                                            setEditValue(attr.values.join(', ') || '');
                                        }}
                                        sx={{
                                            color: 'rgba(129, 140, 248, 0.3)',
                                            '&:hover': {color: '#818cf8'}
                                        }}
                                    >
                                        <Edit fontSize="small"/>
                                    </IconButton>
                                )}
                                <Tooltip title="Reset">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleReset(attr.attributeId)}
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.1)',
                                            '&:hover': {color: '#ef4444'}
                                        }}
                                    >
                                        <RestartAlt fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        }
                    />
                );
            })}
        </Stack>
    );
}