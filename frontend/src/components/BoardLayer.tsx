// src/components/BoardLayer.tsx
import React from 'react';
import Cell from './Cell';
import { Symbol } from '../hooks/useGameState';

type Props = {
    layer: Symbol[][]; // 3x3
    z: number;
    onCellClick: (x: number, y: number, z: number) => void;
};

const BoardLayer: React.FC<Props> = ({ layer, z, onCellClick }) => (
    <section className="layer" data-testid="board-layer">
        <div className="layer-title">Layer {z + 1}</div>
        <div className="layer-grid" role="grid" aria-label={`Layer ${z + 1}`}>
            {layer.map((row, y) =>
                row.map((cell, x) => (
                    <Cell
                        key={`${x}-${y}-${z}`}
                        value={cell}
                        onClick={() => onCellClick(x, y, z)}
                        data-x={x}
                        data-y={y}
                        data-z={z}
                    />
                ))
            )}
        </div>
    </section>
);

export default BoardLayer;
