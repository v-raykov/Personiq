import {useEffect, useState} from 'react';
import {getActionById, getCustomerAttributes, getItems} from '@/api';

export function useReactionForm(open, tenantUri, ruleActionUri) {
    const [type, setType] = useState('attribute');
    const [targetAttr, setTargetAttr] = useState(null);
    const [operation, setOperation] = useState('SET');
    const [value, setValue] = useState('');
    const [isLinked, setIsLinked] = useState(false);
    const [customerAttrs, setCustomerAttrs] = useState([]);
    const [actionAttrs, setActionAttrs] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [itemFields, setItemFields] = useState({});

    useEffect(() => {
        let isMounted = true;

        if (open) {
            (async () => {
                try {
                    const [attrs, itemsRes] = await Promise.all([
                        getCustomerAttributes(tenantUri),
                        getItems(tenantUri)
                    ]);

                    if (isMounted) {
                        setCustomerAttrs(attrs.data || []);
                        setItems(itemsRes.data || []);
                    }

                    if (ruleActionUri) {
                        const actionRes = await getActionById(tenantUri, ruleActionUri);
                        if (isMounted) setActionAttrs(actionRes.data?.attributes || []);
                    }
                } catch (err) {
                    console.error(err);
                }
            })();
        }

        return () => {
            isMounted = false;
            setTargetAttr(null);
            setOperation('SET');
            setValue('');
            setIsLinked(false);
            setSelectedTemplate(null);
            setItemFields({});
            setType('attribute');
        };
    }, [open, tenantUri, ruleActionUri]);

    return {
        type, setType,
        targetAttr, setTargetAttr,
        operation, setOperation,
        value, setValue,
        isLinked, setIsLinked,
        customerAttrs,
        actionAttrs,
        items,
        selectedTemplate, setSelectedTemplate,
        itemFields, setItemFields
    };
}