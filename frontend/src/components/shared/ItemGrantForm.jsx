import React from 'react';
import {Autocomplete, Stack, TextField} from "@mui/material";
import AttributeField from '@/components/shared/AttributeField.jsx';
import dayjs from 'dayjs';

import {glassInputStyles} from '@/styles/formStyles.js'

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
                        sx={glassInputStyles}
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
                            isList={attr.isList}
                            value={itemFields[attr.id] ?? ''}
                            onChange={(val) => setItemFields({...itemFields, [attr.id]: val})}
                        />
                    ))}
                </Stack>
            )}
        </Stack>
    );
}