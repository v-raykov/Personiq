import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateTenant from './pages/CreateTenant';
import SelectTenant from './pages/SelectTenant';
import Auth from './pages/Auth';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<SelectTenant />} />

                <Route path="/tenant" element={<CreateTenant />} />

                <Route path="/:tenantUri/login" element={<Auth mode="login" />} />
                <Route path="/:tenantUri/register" element={<Auth mode="register" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;