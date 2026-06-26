// app/components/ui/Skeleton.tsx
"use client";

import React from 'react';

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
    rounded?: string;
}

/**
 * Мерцающий плейсхолдер-скелетон в брендовой гамме.
 * Использует утилиту .skeleton из globals.css.
 */
const Skeleton: React.FC<SkeletonProps> = ({ className = '', style, rounded = 'rounded-xl' }) => {
    return (
        <div
            className={`skeleton ${rounded} ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
};

export default Skeleton;
