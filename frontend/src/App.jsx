import {BrowserRouter, Navigate, Route, Routes, useParams} from 'react-router-dom';
import {CssBaseline, ThemeProvider} from '@mui/material';
import theme from './theme';
import {AuthProvider} from './context/AuthProvider.jsx';
import SelectTenant from './pages/auth/SelectTenant';
import CreateTenant from './pages/auth/CreateTenant';
import Auth from './pages/auth/Auth';
import Layout from './components/Layout';
import Account from './pages/admin/Account.jsx';
import Manage from './pages/admin/Manage.jsx';
import CustomerAttributes from './pages/admin/CustomerAttributes.jsx'
import ProtectedRoute from './components/ProtectedRoute';
import CustomerAttributesValues from "./pages/admin/CustomerAttributesValues.jsx";
import AttributeManagement from "./components/customers/CustomerWrapper.jsx";
import Actions from './pages/admin/Actions.jsx';
import Items from "./pages/admin/Items.jsx";
import Rules from "./pages/admin/Rules.jsx"
import Reactions from "./pages/admin/Reactions.jsx"
import ActionExecution from "@/pages/admin/ActionExecution.jsx";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {useAuth} from "@/hooks/useAuth.js";
import CustomerPortalAttributeValues from "@/pages/customer/CustomerPortalAttributeValues.jsx";
import CustomerPortalGrantedItems from "@/pages/customer/CustomerPortalGrantedItems.jsx";
import CustomerExecutedActions from "@/pages/customer/CustomerPortalExecutedActions.jsx";

const RoleGuard = ({children, role}) => {
    const {user} = useAuth();
    const {tenantUri} = useParams();

    if (user?.role !== role) {
        return <Navigate to={`/${tenantUri}/account`} replace/>;
    }
    return children;
};

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <CssBaseline/>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<SelectTenant/>}/>
                            <Route path="/tenant" element={<CreateTenant/>}/>
                            <Route path="/:tenantUri/login" element={<Auth/>}/>

                            {/* Unified Protected Area */}
                            <Route
                                path="/:tenantUri"
                                element={
                                    <ProtectedRoute>
                                        <Layout/>
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<Navigate to="account" replace/>}/>

                                {/* SHARED: Visible to both ADMIN and CUSTOMER */}
                                <Route path="account" element={<Account/>}/>

                                {/* ADMIN ONLY: Wrapped in RoleGuard */}
                                <Route path="manage" element={<RoleGuard role="ADMIN"><Manage/></RoleGuard>}/>
                                <Route path="customer-attribues-values"
                                       element={<RoleGuard role="ADMIN"><CustomerAttributes/></RoleGuard>}/>
                                <Route path="customer-attributes"
                                       element={<RoleGuard role="ADMIN"><CustomerAttributesValues/></RoleGuard>}/>
                                <Route path="customers"
                                       element={<RoleGuard role="ADMIN"><AttributeManagement/></RoleGuard>}/>
                                <Route path="actions" element={<RoleGuard role="ADMIN"><Actions/></RoleGuard>}/>
                                <Route path="items" element={<RoleGuard role="ADMIN"><Items/></RoleGuard>}/>
                                <Route path="rules" element={<RoleGuard role="ADMIN"><Rules/></RoleGuard>}/>
                                <Route path="rules/:ruleId/reactions"
                                       element={<RoleGuard role="ADMIN"><Reactions/></RoleGuard>}/>
                                <Route path="execute-action"
                                       element={<RoleGuard role="ADMIN"><ActionExecution/></RoleGuard>}/>

                                {/* CUSTOMER ONLY */}
                                <Route path="attribute-values"
                                       element={<RoleGuard
                                           role="CUSTOMER"><CustomerPortalAttributeValues/></RoleGuard>}/>
                                <Route path="granted-items"
                                       element={<RoleGuard role="CUSTOMER"><CustomerPortalGrantedItems/></RoleGuard>}/>
                                <Route path="executed-actions"
                                       element={<RoleGuard role="CUSTOMER"><CustomerExecutedActions/></RoleGuard>}/>

                            </Route>

                            <Route path="*" element={<Navigate to="/" replace/>}/>
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </LocalizationProvider>
        </ThemeProvider>
    );
}