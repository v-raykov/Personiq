import {useCallback, useEffect, useRef, useState} from 'react';
import {getBulkAttributes, getCustomerAttributes, getCustomers} from '@/api';

export const useCustomerData = (tenantUri) => {
    const [customers, setCustomers] = useState([]);
    const [attributeData, setAttributeData] = useState({});
    const [schema, setSchema] = useState([]);
    const [loading, setLoading] = useState(true);
    const isFetching = useRef(false);

    const fetchData = useCallback(async () => {
        if (!tenantUri || isFetching.current) return;

        isFetching.current = true;
        setLoading(true);

        try {
            const [custRes, schemaRes] = await Promise.all([
                getCustomers(tenantUri),
                getCustomerAttributes(tenantUri)
            ]);

            const customerList = custRes?.data || [];
            const schemaList = schemaRes?.data || [];

            setCustomers(customerList);
            setSchema(schemaList);

            if (customerList.length > 0) {
                const ids = customerList.map(c => c.customerId);
                const {data: attrMap} = await getBulkAttributes(tenantUri, ids);
                setAttributeData(attrMap || {});
            } else {
                setAttributeData({});
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [tenantUri]);

    useEffect(() => {
        fetchData().catch(err => {
            console.error("Failed to fetch customer data:", err);
        });
    }, [fetchData]);

    return {
        customers,
        attributeData,
        schema,
        loading,
        refresh: fetchData
    };
};