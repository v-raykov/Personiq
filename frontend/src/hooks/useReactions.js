import {useCallback, useEffect, useRef, useState} from 'react';
import {getActionById, getReactions, getRules} from '@/api';

export const useReactions = (tenantUri, ruleId) => {
    const [reactions, setReactions] = useState([]);
    const [rule, setRule] = useState(null);
    const [actionMetadata, setActionMetadata] = useState(null);
    const isFetching = useRef(false);

    const loadData = useCallback(async () => {
        if (!tenantUri || !ruleId || isFetching.current) return;

        isFetching.current = true;
        try {
            const [reRes, ruRes] = await Promise.all([
                getReactions(tenantUri),
                getRules(tenantUri)
            ]);

            const allReactions = reRes?.data || [];
            const allRules = ruRes?.data || [];
            const currentRule = allRules.find(r => String(r.id) === String(ruleId));

            setReactions(allReactions.filter(r => String(r.ruleId) === String(ruleId)));
            setRule(currentRule || null);

            if (currentRule?.triggerActionId) {
                const actionRes = await getActionById(tenantUri, currentRule.triggerActionId);
                setActionMetadata(actionRes?.data || null);
            }
        } catch (err) {
            console.error("Failed to load reactions:", err);
        } finally {
            isFetching.current = false;
        }
    }, [tenantUri, ruleId]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    return {
        reactions,
        rule,
        actionMetadata,
        LoadData: loadData
    };
};