import {useCallback, useEffect, useRef, useState} from 'react';
import {createItem, createItemAttribute, deleteItem, deleteItemAttribute, getItems} from '@/api';

export const useItems = (tenantUri) => {
    const [items, setItems] = useState([]);
    const isFetching = useRef(false);

    const loadItems = useCallback(async () => {
        if (!tenantUri || isFetching.current) return;
        isFetching.current = true;
        try {
            const res = await getItems(tenantUri);
            setItems(res.data || []);
        } catch (err) {
            console.error("Failed to load items", err);
        } finally {
            isFetching.current = false;
        }
    }, [tenantUri]);

    useEffect(() => {
        void loadItems();
    }, [loadItems]);

    const handleCreate = async (name) => {
        await createItem(tenantUri, name, []);
        await loadItems();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this item blueprint?")) {
            await deleteItem(tenantUri, id);
            await loadItems();
        }
    };

    const handleDeleteAttribute = async (attrId) => {
        await deleteItemAttribute(tenantUri, attrId);
        await loadItems();
    };

    const handleAddAttribute = async (itemId, payload) => {
        await createItemAttribute(tenantUri, itemId, payload);
        await loadItems();
    };

    return {
        items,
        loadItems,
        handleCreate,
        handleDelete,
        handleDeleteAttribute,
        handleAddAttribute
    };
};