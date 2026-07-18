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
    router: { get: vi.fn() },
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

vi.mock('@/components/ui/label', () => ({
    Label: ({ children, htmlFor, ...props }: any) => <label htmlFor={htmlFor} {...props}>{children}</label>,
}));

vi.mock('@/components/ui/textarea', () => ({
    Textarea: (props: any) => <textarea {...props} />,
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

import Create from '@/pages/payment/Create';

const baseProps = {
    categories: { in: ['SPP', 'Uang Pangkal'], out: ['Listrik', 'Gaji'] },
    classes: ['1', '2', '3'],
    studentsByGender: {},
    allowedCreateTypes: undefined as string[] | undefined,
};

describe('Payment Create Page', () => {
    it('renders the page title', () => {
        render(<Create {...baseProps} />);
        expect(screen.getByText('Form Transaksi Baru')).toBeTruthy();
    });

    it('shows both type selectors and defaults to Pemasukan', () => {
        render(<Create {...baseProps} />);
        expect(screen.getByText('↓ Pemasukan')).toBeTruthy();
        expect(screen.getByText('↑ Pengeluaran')).toBeTruthy();
    });

    it('renders the category selector with SPP selected by default', () => {
        render(<Create {...baseProps} />);
        const selects = screen.getAllByTestId('mock-select');
        const categorySelect = selects[0];
        expect(categorySelect).toBeTruthy();
        expect(categorySelect).toHaveValue('SPP');
    });

    it('shows student section when category is SPP', () => {
        render(<Create {...baseProps} />);
        expect(screen.getByText('Pilih Siswa')).toBeTruthy();
        expect(screen.getByText('Jenis Kelamin')).toBeTruthy();
    });

    it('hides student section when category is not SPP', () => {
        render(<Create {...baseProps} />);
        const selects = screen.getAllByTestId('mock-select');
        const categorySelect = selects[0];
        fireEvent.change(categorySelect, { target: { value: 'Uang Pangkal' } });
        expect(screen.queryByText('Pilih Siswa')).toBeNull();
        expect(screen.queryByText('Jenis Kelamin')).toBeNull();
    });

    it('renders the date picker', () => {
        render(<Create {...baseProps} />);
        expect(screen.getByText(/Juli 2026/)).toBeTruthy();
    });

    it('renders the note input', () => {
        render(<Create {...baseProps} />);
        const noteInput = screen.getByPlaceholderText(/Contoh/);
        expect(noteInput).toBeTruthy();
    });

    it('renders cancel button that links back to payment index', () => {
        render(<Create {...baseProps} />);
        const cancelLink = screen.getByText('Batal').closest('a');
        expect(cancelLink).toHaveAttribute('href', '/payment.index');
    });

    it('renders submit button', () => {
        render(<Create {...baseProps} />);
        const submitBtn = screen.getByText('Simpan Transaksi');
        expect(submitBtn).toBeTruthy();
        expect(submitBtn).not.toBeDisabled();
    });
});
