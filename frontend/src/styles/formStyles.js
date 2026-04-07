export const glassInputStyles = {
    '& .MuiOutlinedInput-root': {
        height: 64,
        borderRadius: '16px',
        bgcolor: 'rgba(255,255,255,0.03)',
        color: '#fff',
        transition: 'all 0.2s ease-in-out',
        '& fieldset': {border: '1px solid rgba(255,255,255,0.1)'},
        '&:hover fieldset': {
            borderColor: 'rgba(255,255,255,0.25)',
            bgcolor: 'rgba(255,255,255,0.05)'
        },
        '&.Mui-focused fieldset': {
            border: '1px solid #6366f1',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)'
        },
    },
    '& .MuiInputLabel-root': {
        color: '#94a3b8',
        fontSize: '1.1rem',
        '&.Mui-focused': {color: '#6366f1'},
        '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
            fontWeight: 700
        }
    }
};