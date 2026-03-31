import {createTheme} from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#818cf8',
        },
        background: {
            default: '#0f172a',
            paper: 'rgba(30, 41, 59, 0.5)',
        },
    },
    shape: {
        borderRadius: 20,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    margin: 0,
                    padding: 0,
                    backgroundColor: '#0f172a',
                    backgroundImage: `
                        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),
                        radial-gradient(at 50% 100%, rgba(79, 70, 229, 0.1) 0px, transparent 50%)
                    `,
                    backgroundAttachment: 'fixed',
                    fontFamily: '"Inter", sans-serif',
                    color: '#f8fafc',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
            },
        },
    },
});

export default theme;