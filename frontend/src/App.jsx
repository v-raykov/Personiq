import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from '@mui/material';
import theme from './theme';
import {AuthProvider} from './context/AuthProvider.jsx';
import SelectTenant from './pages/SelectTenant';
import CreateTenant from './pages/CreateTenant';
import Auth from './pages/Auth';
import {useAuth} from "./hooks/useAuth.js";
import Layout from './components/Layout';
import Account from './pages/Account';

const ProtectedRoute = ({children}) => {
    const {user, loading} = useAuth();
    if (loading) return null;
    if (!user) return <Navigate replace to="/"/>;
    return children;
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<SelectTenant/>}/>
                        <Route path="/tenant" element={<CreateTenant/>}/>
                        <Route path="/:tenantUri/login" element={<Auth/>}/>

                        <Route
                            path="/:tenantUri/account"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Account/>
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;