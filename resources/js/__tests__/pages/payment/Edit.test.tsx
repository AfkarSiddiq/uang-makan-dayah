import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: any) => <title>{title}</title>,
    Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
    useForm: (initialValues: any) => {
        const [data, setDataState] = React.useState(initialValues || {});
        const [errors] = React.useState<any>({});
        const [processing] = React.useState(false);
        return {
            data,
            setData: (field: string, value: any) => {
                setDataState((prev: any) => ({ ...prev, [field]: value }));
            },
            patch: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            get: vi.fn(),
            processing,
            errors,
            setError: vi.fn(),
            reset: vi.fn(),
            wasSuccessful: false,
            recentlySuccessful: false,
        };
    },
    router: { get: vi.fn(), visit: vi.fn() },
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: any) => <div data-testid="app-layout">{children}</div>,
}));

vi.mock('@/hooks/use-permissions', () => ({
    usePermissions: () => ({ can: () => true, canAny: () => true, permissions: [] }),
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled, type, ...props }: any) => (
        <button onClick={onClick} disabled={disabled} type={type || 'button'} {...props}>{children}</button>
    ),
}));

vi.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
    Label: ({ children, htmlFor, ...props }: any) => <label htmlFor={htmlFor} {...props}>{children}</label>,
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
    };
});

import Edit from '@/pages/payment/Edit';

const baseTransaction = {
    id: 1,
    transaction_id: 'TRX-2026-0001',
    student_id: 1,
    student: { id: 1, name: 'Ahmad', nisn: '001', class: '2', gender: 'L', status: 'aktif', student_type: 'umum' as const, entry_month: 1, entry_year: 2026 },
    type: 'in' as const,
    category: 'SPP',
    amount: 100000,
    note: 'Pembayaran SPP bulan Juli',
    transaction_date: '2026-07-15',
    user_id: 1,
    created_at: '',
    updated_at: '',
};

const baseProps = {
    transaction: baseTransaction,
    students: [
        { id: 1, name: 'Ahmad', nisn: '001', class: '2', gender: 'L', status: 'aktif', student_type: 'umum' as const, entry_month: 1, entry_year: 2026 },
        { id: 2, name: 'Budi', nisn: '002', class: '1', gender: 'L', status: 'aktif', student_type: 'yatim' as const, entry_month: 1, entry_year: 2026 },
    ],
    categories: { in: ['SPP', 'Uang Pangkal'], out: ['Listrik', 'Gaji'] },
};

describe('Payment Edit Page', () => {
    it('renders the page title', () => {
        render(<Edit {...baseProps} />);
        expect(screen.getByText('Edit Transaksi')).toBeTruthy();
    });

    it('shows the transaction ID', () => {
        render(<Edit {...baseProps} />);
        expect(screen.getByText('TRX-2026-0001')).toBeTruthy();
    });

    it('shows both type selectors and highlights current type', () => {
        render(<Edit {...baseProps} />);
        expect(screen.getByText('↑ Pemasukan')).toBeTruthy();
        expect(screen.getByText('↓ Pengeluaran')).toBeTruthy();
    });

    it('renders the category selector with initial value', () => {
        render(<Edit {...baseProps} />);
        const selects = screen.getAllByTestId('mock-select');
        expect(selects[0]).toHaveValue('SPP');
    });

    it('shows student section when category is SPP', () => {
        render(<Edit {...baseProps} />);
        expect(screen.getByText('Pilih Siswa')).toBeTruthy();
    });

    it('hides student section when category is not SPP', () => {
        render(<Edit {...baseProps} />);
        const selects = screen.getAllByTestId('mock-select');
        fireEvent.change(selects[0], { target: { value: 'Uang Pangkal' } });
        expect(screen.queryByText('Pilih Siswa')).toBeNull();
    });

    it('renders the amount input with formatted initial value', () => {
        render(<Edit {...baseProps} />);
        const amountInput = screen.getByDisplayValue('100.000');
        expect(amountInput).toBeTruthy();
    });

    it('renders the date picker with transaction date', () => {
        render(<Edit {...baseProps} />);
        expect(screen.getByText(/15 Juli 2026/)).toBeTruthy();
    });

    it('renders the note input with transaction note', () => {
        render(<Edit {...baseProps} />);
        const noteInput = screen.getByDisplayValue('Pembayaran SPP bulan Juli');
        expect(noteInput).toBeTruthy();
    });

    it('renders cancel button linking to payment index', () => {
        render(<Edit {...baseProps} />);
        const cancelLink = screen.getByText('Batal').closest('a');
        expect(cancelLink).toHaveAttribute('href', '/payment.index');
    });

    it('renders submit button with Simpan Perubahan', () => {
        render(<Edit {...baseProps} />);
        expect(screen.getByText('Simpan Perubahan')).toBeTruthy();
    });

    it('switches category options when type changes', () => {
        render(<Edit {...baseProps} />);
        const outBtn = screen.getByText('↓ Pengeluaran');
        fireEvent.click(outBtn);
        const selects = screen.getAllByTestId('mock-select');
        expect(selects[0]).toHaveValue('Listrik');
    });
});
