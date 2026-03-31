import React from 'react';
import {Autocomplete, Stack, TextField} from "@mui/material";
import AttributeField from './AttributeField';
import dayjs from 'dayjs';

const fieldStyles = {
    '& .MuiOutlinedInput-root': {
        height: 64,
        borderRadius: '16px',
        bgcolor: 'rgba(255,255,255,0.03)',
        color: '#fff',
        '& fieldset': {border: '1px solid rgba(255,255,255,0.1)'},
        '&:hover fieldset': {borderColor: 'rgba(255,255,255,0.25)', bgcolor: 'rgba(255,255,255,0.05)'},
        '&.Mui-focused fieldset': {border: '1px solid #6366f1'},
    },
    '& .MuiInputLabel-root': {
        color: '#94a3b8',
        fontSize: '1.1rem',
        '&.Mui-focused': {color: '#6366f1'},
        '&.MuiInputLabel-shrink': {transform: 'translate(14px, -9px) scale(0.75)'}
    }
};

export default function ItemGrantForm({
                                          items = [],
                                          itemFields = {},
                                          setItemFields,
                                          selectedTemplate,
                                          setSelectedTemplate
                                      }) {
    const selectedItem = items.find(i => i.id === selectedTemplate);

    const handleTemplateChange = (v) => {
        setSelectedTemplate(v?.id || null);
        const fields = {};
        if (v?.attributes) {
            v.attributes.forEach(attr => {
                if (attr.valueType === 'BOOLEAN') fields[attr.id] = 'false';
                else if (attr.valueType === 'DATE') fields[attr.id] = dayjs().toISOString();
                else fields[attr.id] = '';
            });
        }
        setItemFields(fields);
    };

    return (
        <Stack spacing={2.5}>
            <Autocomplete
                options={items}
                getOptionLabel={(option) => option.name || `Item #${option.id}`}
                value={selectedItem || null}
                disableClearable
                onChange={(e, v) => handleTemplateChange(v)}
                onInputChange={(e, v, reason) => {
                    if (reason === 'input') e.preventDefault();
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Select Item to Grant"
                        sx={fieldStyles}
                        slotProps={{
                            htmlInput: {
                                ...params.inputProps,
                                readOnly: true,
                            },
                        }}/>
                )}
            />

            {selectedTemplate && selectedItem?.attributes && (
                <Stack spacing={2.5}>
                    {selectedItem.attributes.map(attr => (
                        <AttributeField
                            key={attr.id}
                            label={attr.name || attr.id}
                            vType={attr.valueType}
                            value={itemFields[attr.id] ?? ''}
                            onChange={(val) => setItemFields({...itemFields, [attr.id]: val})}
                        />
                    ))}
                </Stack>
            )}
        </Stack>
    );
}