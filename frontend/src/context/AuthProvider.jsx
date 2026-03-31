import {useCallback, useEffect, useState} from 'react';
import {AuthContext} from './AuthContext';
import {getMe} from '@/api';

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkUser = useCallback(async (tenantUri) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await getMe(tenantUri);
            setUser({...res.data, role: res.data.authority.slice(5)});
        } catch {
            setUser(null);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const pathParts = window.location.pathname.split('/');
        const tenantFromUrl = pathParts[1];

        if (tenantFromUrl && tenantFromUrl !== 'tenant' && tenantFromUrl !== '') {
            checkUser(tenantFromUrl).catch(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [checkUser]);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('token');
        window.location.href = '/';
    }, []);

    return (
        <AuthContext.Provider value={{user, setUser, loading, checkUser, logout}}>
            {children}
        </AuthContext.Provider>
    );
}