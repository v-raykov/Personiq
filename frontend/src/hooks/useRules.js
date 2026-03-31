import {useCallback, useEffect, useRef, useState} from 'react';
import {getActions, getRules} from '@/api';

export const useRules = (tenantUri) => {
    const [rules, setRules] = useState([]);
    const [actions, setActions] = useState([]);
    const isFetching = useRef(false);

    const loadData = useCallback(async () => {
        if (!tenantUri || isFetching.current) return;

        isFetching.current = true;
        try {
            const [rRes, aRes] = await Promise.all([
                getRules(tenantUri),
                getActions(tenantUri)
            ]);
            setRules(rRes?.data || []);
            setActions(aRes?.data || []);
        } catch (err) {
            console.error("Failed to load rules data:", err);
        } finally {
            isFetching.current = false;
        }
    }, [tenantUri]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    return {
        rules,
        actions,
        LoadData: loadData
    };
};