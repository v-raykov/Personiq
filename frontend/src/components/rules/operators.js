import dayjs from 'dayjs';

export const SUPPORTED_OPERATORS = {
    STRING: [
        { label: 'Equal to', value: '=' },
        { label: 'Not equal to', value: '!=' },
        { label: 'Contains', value: '~' },
        { label: 'Not contains', value: '!~' }
    ],
    NUMBER: [
        { label: 'Equal to', value: '=' },
        { label: 'Not equal to', value: '!=' },
        { label: 'Greater than', value: '>' },
        { label: 'Less than', value: '<' },
        { label: 'Greater than or equal to', value: '>=' },
        { label: 'Less than or equal to', value: '<=' }
    ],
    DATE: [
        { label: 'Equal to', value: '=' },
        { label: 'Not equal to', value: '!=' },
        { label: 'After', value: '>' },
        { label: 'Before', value: '<' }
    ],
    BOOLEAN: [
        { label: 'Equal to', value: '=' }
    ]
};

export const getInitialValue = (type) => {
    if (type === 'BOOLEAN') return 'false';
    if (type === 'DATE') return dayjs().toISOString();
    return '';
};

export const cleanTree = (nodes) => {
    return nodes
        .filter(n => n !== null && n !== undefined)
        .map(n => n.children ? { ...n, children: cleanTree(n.children) } : n)
        .filter(n => n.type === 'condition' || (n.children && n.children.length > 0));
};