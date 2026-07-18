import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: any) => <title>{title}</title>,
    Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
    router: { get: vi.fn(), delete: vi.fn() },
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: any) => <div data-testid="app-layout">{children}</div>,
}));

vi.mock('@/hooks/use-permissions', () => ({
    usePermissions: () => ({ can: () => true, canAny: () => true, permissions: [] }),
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled, type, className, variant, ...props }: any) => (
        <button onClick={onClick} disabled={disabled} type={type || 'button'} className={className} {...props}>{children}</button>
    ),
}));

vi.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/search-input', () => ({
    SearchInput: ({ value, onChange, onSubmit, onClear, placeholder, showButton }: any) => (
        <div data-testid="search-input">
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} data-testid="search-field" />
            {showButton && <button onClick={onSubmit} data-testid="search-btn">Cari</button>}
            {value && onClear && <button onClick={onClear} data-testid="clear-btn">X</button>}
        </div>
    ),
}));

vi.mock('@/components/ui/select', () => {
    const processOptions = (children: any): { value: string; label: string; disabled?: boolean }[] => {
        const opts: { value: string; label: string; disabled?: boolean }[] = [];
        const walk = (child: any) => {
            if (!child) return;
            if (Array.isArray(child)) { child.forEach(walk); return; }
            if (child.type?.displayName === 'SelectItem') {
                opts.push({ value: child.props.value, label: child.props.children, disabled: child.props.disabled });
            }
            if (child.props?.children) walk(child.props.children);
        };
        walk(children);
        return opts;
    };
    const MockItem = ({ children }: any) => <>{children}</>;
    MockItem.displayName = 'SelectItem';
    const MockContent = ({ children }: any) => <>{children}</>;
    MockContent.displayName = 'SelectContent';
    const MockGroup = ({ children }: any) => <>{children}</>;
    MockGroup.displayName = 'SelectGroup';
    return {
        Select: ({ value, onValueChange, disabled, children, ...props }: any) => {
            const opts = processOptions(children);
            return (
                <select value={value || ''} onChange={(e) => onValueChange?.(e.target.value)} disabled={disabled} data-testid="mock-select" {...props}>
                    {opts.map((opt) => (
                        <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
                    ))}
                </select>
            );
        },
        SelectContent: MockContent,
        SelectItem: MockItem,
        SelectTrigger: ({ children }: any) => <>{children}</>,
        SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
        SelectGroup: MockGroup,
    };
});

import Index from '@/pages/payment/Index';

const baseProps = {
    transactions: {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
    },
    summary: { total_in: 0, total_out: 0, balance: 0 },
    filters: {},
    categories: { in: ['SPP', 'Uang Pangkal'], out: ['Listrik', 'Gaji'] },
    allowedTypes: ['in', 'out'],
};

describe('Payment Index Page', () => {
    it('renders the page title', () => {
        render(<Index {...baseProps} />);
        expect(screen.getByText('Transaksi')).toBeTruthy();
    });

    it('shows empty state when no transactions (desktop + mobile)', () => {
        render(<Index {...baseProps} />);
        const emptyMessages = screen.getAllByText('Tidak ada transaksi ditemukan');
        expect(emptyMessages.length).toBe(2);
    });

    it('renders summary cards with correct amounts', () => {
        render(<Index {...baseProps} summary={{ total_in: 100000, total_out: 40000, balance: 60000 }} />);
        expect(screen.getByText('Total Masuk')).toBeTruthy();
        expect(screen.getByText('Total Keluar')).toBeTruthy();
        expect(screen.getByText('Saldo')).toBeTruthy();
        expect(screen.getByText(/100\.000/)).toBeTruthy();
        expect(screen.getByText(/40\.000/)).toBeTruthy();
        expect(screen.getByText(/60\.000/)).toBeTruthy();
    });

    it('renders transaction rows', () => {
        const props = {
            ...baseProps,
            transactions: {
                data: [
                    { id: 1, transaction_id: 'TRX-2026-0001', type: 'in' as const, category: 'SPP', amount: 100000, note: 'Pembayaran SPP', transaction_date: '2026-07-01', student_id: 1, student: { id: 1, name: 'Ahmad', nisn: '001', class: '1', gender: 'L', status: 'aktif', student_type: 'umum' as const, entry_month: 1, entry_year: 2026 }, user_id: 1, created_at: '', updated_at: '' },
                    { id: 2, transaction_id: 'TRX-2026-0002', type: 'out' as const, category: 'Listrik', amount: 50000, note: 'Bayar listrik', transaction_date: '2026-07-02', student_id: null, student: undefined, user_id: 1, created_at: '', updated_at: '' },
                ],
                current_page: 1, last_page: 1, per_page: 15, total: 2, from: 1, to: 2,
            },
        };
        render(<Index {...props} />);
        expect(screen.getAllByText('TRX-2026-0001').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('TRX-2026-0002').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Ahmad').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Bayar listrik').length).toBeGreaterThanOrEqual(1);
    });

    it('shows add transaction button when user has permission', () => {
        render(<Index {...baseProps} />);
        expect(screen.getByText('Tambah Transaksi')).toBeTruthy();
    });

    it('toggles filter panel', () => {
        render(<Index {...baseProps} />);
        const filterBtn = screen.getByText('Filter');
        fireEvent.click(filterBtn);
        expect(screen.getByText('Tipe')).toBeTruthy();
        expect(screen.getByText('Dari Tanggal')).toBeTruthy();
        expect(screen.getByText('Sampai Tanggal')).toBeTruthy();
        fireEvent.click(filterBtn);
        expect(screen.queryByText('Dari Tanggal')).toBeNull();
    });

    it('shows reset button when filters are active', () => {
        render(<Index {...baseProps} filters={{ type: 'in' }} />);
        expect(screen.getByText('Reset')).toBeTruthy();
    });
});
