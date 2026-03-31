import {useCallback, useEffect, useRef, useState} from 'react';
import {createAction, createActionAttribute, deleteAction, deleteActionAttribute, getActions} from '@/api';

export const useActions = (tenantUri) => {
    const [actions, setActions] = useState([]);
    const isFetching = useRef(false);

    const loadActions = useCallback(async () => {
        if (!tenantUri || isFetching.current) return;
        isFetching.current = true;
        try {
            const res = await getActions(tenantUri);
            setActions(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            isFetching.current = false;
        }
    }, [tenantUri]);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            if (!tenantUri) return;
            try {
                const res = await getActions(tenantUri);
                if (isMounted) setActions(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        void fetchData();
        return () => {
            isMounted = false;
        };
    }, [tenantUri]);

    const handleCreate = async (name) => {
        await createAction(tenantUri, name, []);
        await loadActions();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this action module?")) {
            await deleteAction(tenantUri, id);
            await loadActions();
        }
    };

    const handleDeleteAttribute = async (attrId) => {
        await deleteActionAttribute(tenantUri, attrId);
        await loadActions();
    };

    const handleAddAttribute = async (actionId, payload) => {
        await createActionAttribute(tenantUri, actionId, payload);
        await loadActions();
    };

    return {
        actions,
        loadActions,
        handleCreate,
        handleDelete,
        handleDeleteAttribute,
        handleAddAttribute
    };
};