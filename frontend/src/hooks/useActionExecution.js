import {useEffect, useState} from 'react';
import {executeAction, getActions} from '@/api';

export const useActionExecution = (tenantUri) => {
    const [actions, setActions] = useState([]);
    const [selectedAction, setSelectedAction] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        getActions(tenantUri).then(res => {
            if (isMounted) setActions(res?.data || []);
        });
        return () => {
            isMounted = false;
        };
    }, [tenantUri]);

    const handleActionChange = (action) => {
        setSelectedAction(action);
        const initialData = {};
        action?.attributes?.forEach(attr => {
            initialData[attr.id] = "";
        });
        setFormData(initialData);
    };

    const updateAttribute = (id, value) => {
        setFormData(prev => ({...prev, [id]: value}));
    };

    const submit = async (customerId) => {
        if (!selectedAction || !customerId) return;
        setLoading(true);

        try {
            const payload = {};
            selectedAction.attributes?.forEach(attr => {
                const val = formData[attr.id];
                if (val !== undefined && val !== null) {
                    payload[Number(attr.id)] = val;
                }
            });

            const res = await executeAction(
                tenantUri,
                selectedAction.id,
                customerId,
                payload
            );

            return res.data;
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        actions,
        selectedAction,
        formData,
        loading,
        handleActionChange,
        updateAttribute,
        submit
    };
};