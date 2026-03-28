import dayjs from 'dayjs';

export const SUPPORTED_OPERATORS = {
    STRING: [
        {label: 'equal to', value: '='},
        {label: 'not equal to', value: '!='},
        {label: 'contains', value: '~'},
        {label: 'not contains', value: '!~'}
    ],
    NUMBER: [
        {label: 'equal to', value: '='},
        {label: 'not equal to', value: '!='},
        {label: 'greater than', value: '>'},
        {label: 'less than', value: '<'},
        {label: 'greater than or equal to', value: '>='},
        {label: 'less than or equal to', value: '<='}
    ],
    DATE: [
        {label: 'equal to', value: '='},
        {label: 'not equal to', value: '!='},
        {label: 'after', value: '>'},
        {label: 'before', value: '<'}
    ],
    BOOLEAN: [
        {label: 'equal to', value: '='},
        {label: 'not equal to', value: '!='}
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
        .map(n => n.children ? {...n, children: cleanTree(n.children)} : n)
        .filter(n => n.type === 'condition' || (n.children && n.children.length > 0));
};

export const generateExpression = (node, allAttributes) => {
    if (node.type === 'group') {
        const symbol = node.operator === 'AND' ? '&' : '|';
        const inner = node.children
            .map(child => generateExpression(child, allAttributes))
            .join(` ${symbol} `);
        return node.children.length > 1 ? `(${inner})` : inner;
    }

    let rightSide = node.val;

    if (node.valueMode === 'attribute') {
        const attr = allAttributes.find(a => String(a.id) === String(node.val) || a.name === node.val);
        rightSide = `attr_${attr ? attr.id : 'ERROR_MISSING_ID'}`;
    } else if (node.valueType === 'DATE') {
        rightSide = dayjs(node.val).toISOString();

    }

    return `${node.attrId} ${node.operator} ${rightSide}`;
};