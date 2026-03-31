import {useCallback, useEffect, useRef, useState} from 'react';
import {getUsersAdmin, registerUserAdmin} from '@/api';

export const useUserManagement = (tenantUri, currentUser) => {
    const [users, setUsers] = useState([]);
    const isFetching = useRef(false);

    const fetchUsers = useCallback(async () => {
        if (!tenantUri || !currentUser || currentUser.role !== 'ADMIN' || isFetching.current) return;

        isFetching.current = true;
        try {
            const res = await getUsersAdmin(tenantUri);
            setUsers(res.data || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            isFetching.current = false;
        }
    }, [tenantUri, currentUser]);

    useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

    const handleCreateUser = async (formData) => {
        const roleMap = {'CUSTOMER': 'ROLE_CUSTOMER', 'MANAGER': 'ROLE_MANAGER', 'ADMIN': 'ROLE_ADMIN'};
        await registerUserAdmin(tenantUri, {
            ...formData,
            authority: roleMap[formData.role]
        });
        await fetchUsers();
    };

    return {users, handleCreateUser};
};