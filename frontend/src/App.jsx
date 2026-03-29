import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {CssBaseline, ThemeProvider} from '@mui/material';
import theme from './theme';
import {AuthProvider} from './context/AuthProvider.jsx';
import SelectTenant from './pages/auth/SelectTenant';
import CreateTenant from './pages/auth/CreateTenant';
import Auth from './pages/auth/Auth';
import Layout from './components/Layout';
import Account from './pages/Account';
import Manage from './pages/Manage';
import CustomerAttributes from './pages/CustomerAttributes.jsx'
import ProtectedRoute from './components/ProtectedRoute';
import CustomerAttributesValues from "./pages/CustomerAttributesValues.jsx";
import AttributeManagement from "./components/customers/CustomerWrapper.jsx";
import Actions from './pages/Actions';
import Items from "./pages/Items";
import Rules from "./pages/Rules"
import Reactions from "./pages/Reactions"

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<SelectTenant/>}/>
                        <Route path="/tenant" element={<CreateTenant/>}/>
                        <Route path="/:tenantUri/login" element={<Auth/>}/>

                        {/* Protected Dashboard Routes */}
                        <Route
                            path="/:tenantUri"
                            element={
                                <ProtectedRoute>
                                    <Layout/>
                                </ProtectedRoute>
                            }
                        >
                            {/* Redirect /tenant-name to /tenant-name/account */}
                            <Route index element={<Navigate to="account" replace/>}/>

                            <Route path="account" element={<Account/>}/>
                            <Route path="manage" element={<Manage/>}/>
                            <Route path="customer-attribues-values" element={<CustomerAttributes/>}/>
                            <Route path="customer-attributes" element={<CustomerAttributesValues/>}/>
                            <Route path="customers" element={<AttributeManagement/>}/>
                            <Route path="actions" element={<Actions/>}/>
                            <Route path="items" element={<Items/>}/>
                            <Route path="rules" element={<Rules/>}/>
                            <Route path="rules/:ruleId/reactions" element={<Reactions/>}/>
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace/>}/>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;