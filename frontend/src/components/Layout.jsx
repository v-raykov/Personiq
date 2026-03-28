import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar } from '@mui/material';
import { Person, SupervisorAccount, Groups, Bolt, Inventory2, AccountTree } from '@mui/icons-material';
import { useNavigate, useParams, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const drawerWidth = 260;

export default function Layout() {
    const { tenantUri } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        {
            text: 'Account',
            icon: <Person />,
            path: `/${tenantUri}/account`,
            visible: true
        },
        {
            text: 'Management',
            icon: <SupervisorAccount />,
            path: `/${tenantUri}/manage`,
            visible: user?.role === 'ADMIN'
        },
        {
            text: 'Customers',
            icon: <Groups />,
            path: `/${tenantUri}/customers`,
            visible: user?.role === 'ADMIN' || user?.role === 'MANAGER'
        },
        {
            text: 'Actions',
            icon: <Bolt />,
            path: `/${tenantUri}/actions`,
            visible: user?.role === 'ADMIN' || user?.role === 'MANAGER'
        },
        {
            text: 'Items',
            icon: <Inventory2 />,
            path: `/${tenantUri}/items`,
            visible: user?.role === 'ADMIN' || user?.role === 'MANAGER'
        },
        {
            text: 'Rules',
            icon: <AccountTree />,
            path: `/${tenantUri}/rules`,
            visible: user?.role === 'ADMIN' || user?.role === 'MANAGER'
        }
    ];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        bgcolor: 'rgba(15, 23, 42, 0.3)',
                        backdropFilter: 'blur(20px)',
                        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                    },
                }}
            >
                <Box sx={{ p: 4, mb: 2 }}>
                    <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -1, color: '#fff', lineHeight: 1 }}>
                        PERSONIQ
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#818cf8',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            fontSize: '0.65rem',
                            mt: 0.5,
                            display: 'block'
                        }}
                    >
                        {tenantUri?.replace(/-/g, ' ')}
                    </Typography>
                </Box>

                <List sx={{ px: 2 }}>
                    {menuItems.filter(item => item.visible).map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        borderRadius: 3,
                                        bgcolor: active ? 'rgba(129, 140, 248, 0.15)' : 'transparent',
                                        border: active ? '1px solid rgba(129, 140, 248, 0.2)' : '1px solid transparent',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        color: active ? '#818cf8' : 'rgba(255,255,255,0.5)',
                                        minWidth: 40
                                    }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: active ? 800 : 500,
                                            color: active ? '#fff' : 'rgba(255,255,255,0.7)'
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                <Box sx={{ mt: 'auto', p: 3 }}>
                    <Box sx={{
                        p: 2,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <Avatar sx={{ bgcolor: '#818cf8', width: 32, height: 32, fontSize: '0.8rem', fontWeight: 900, mr: 1.5 }}>
                            {user?.username?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="body2" fontWeight={700} noWrap sx={{ color: '#fff' }}>
                                {user?.username}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 700 }}>
                                {user?.role}
                            </Typography>
                        </Box>
                    </Box>
                    <ListItemButton
                        onClick={logout}
                        sx={{
                            borderRadius: 3,
                            color: '#f87171',
                            justifyContent: 'center',
                            fontWeight: 800,
                            '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' }
                        }}
                    >
                        Logout
                    </ListItemButton>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 6 }}>
                <Outlet />
            </Box>
        </Box>
    );
}