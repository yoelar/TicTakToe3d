// src/components/Cell.tsx
import React from 'react';
import '../styles/board.css';

type Props = {
    value: 'X' | 'O' | '';
    onClick: () => void;
    'data-x': number;
    'data-y': number;
    'data-z': number;
};

const Cell: React.FC<Props> = ({ value, onClick }) => {
    const cls = ['cell'];
    if (value === 'X') cls.push('cell-x');
    if (value === 'O') cls.push('cell-o');

    return (
        <button className={cls.join(' ')} onClick={onClick} aria-label={`cell-${value || 'empty'}`}>
            {value}
        </button>
    );
};

export default Cell;
