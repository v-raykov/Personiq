import {useCallback, useEffect, useRef, useState} from 'react';
import {getActionById, getReactions, getRules, getCustomerAttributes, getGrantedItemsByIds} from '@/api';

export const useReactions = (tenantUri, ruleId) => {
    const [reactions, setReactions] = useState([]);
    const [rule, setRule] = useState(null);
    const [actionMetadata, setActionMetadata] = useState(null);
    const [itemTemplates, setItemTemplates] = useState({});
    const isFetching = useRef(false);

    const loadData = useCallback(async () => {
        if (!tenantUri || !ruleId || isFetching.current) return;

        isFetching.current = true;
        try {
            const [reRes, ruRes, attrRes] = await Promise.all([
                getReactions(tenantUri),
                getRules(tenantUri),
                getCustomerAttributes(tenantUri)
            ]);

            const allReactions = reRes?.data || [];
            const allRules = ruRes?.data || [];
            const currentRule = allRules.find(r => String(r.id) === String(ruleId));

            const filteredReactions = allReactions.filter(r => String(r.ruleId) === String(ruleId));

            setRule(currentRule || null);
            setReactions(filteredReactions);

            const itemIds = filteredReactions
                .filter(r => r.templateItemId)
                .map(r => r.templateItemId);

            if (itemIds.length > 0) {
                const itemsRes = await getGrantedItemsByIds(tenantUri, itemIds);
                const itemMap = (itemsRes?.data || []).reduce((acc, item) => {
                    acc[item.id] = item;
                    return acc;
                }, {});
                setItemTemplates(itemMap);
            }

            let metadata = { customerAttrs: attrRes?.data || [] };
            if (currentRule?.triggerActionId) {
                const actionRes = await getActionById(tenantUri, currentRule.triggerActionId);
                metadata = { ...metadata, ...actionRes?.data };
            }
            setActionMetadata(metadata);

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
        itemTemplates,
        LoadData: loadData
    };
};