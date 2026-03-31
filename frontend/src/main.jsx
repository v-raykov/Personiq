import React from 'react';
import ReactDOM from 'react-dom/client';
import {CssBaseline, ThemeProvider} from '@mui/material';
import App from './App';
import theme from './theme';
import {AuthProvider} from "./context/AuthProvider.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <CssBaseline/>
                <App/>
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>
);