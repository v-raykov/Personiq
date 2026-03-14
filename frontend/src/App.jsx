import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthProvider.jsx';
import SelectTenant from './pages/SelectTenant';
import CreateTenant from './pages/CreateTenant';
import Auth from './pages/Auth';
import Layout from './components/Layout';
import Account from './pages/Account';
import Manage from './pages/Manage';
import Customer from './pages/Customer.jsx'
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<SelectTenant />} />
                        <Route path="/tenant" element={<CreateTenant />} />
                        <Route path="/:tenantUri/login" element={<Auth />} />

                        {/* Protected Dashboard Routes */}
                        <Route
                            path="/:tenantUri"
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            {/* Redirect /tenant-name to /tenant-name/account */}
                            <Route index element={<Navigate to="account" replace />} />

                            <Route path="account" element={<Account />} />
                            <Route path="manage" element={<Manage />} />
                            <Route path="customer" element={<Customer/>} />
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;