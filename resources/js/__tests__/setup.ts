import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

(globalThis as any).route = (name: string, params?: any) => {
    if (params) {
        const paramStr = typeof params === 'object' ? Object.values(params).join('/') : params;
        return `/${name}/${paramStr}`;
    }
    return `/${name}`;
};
