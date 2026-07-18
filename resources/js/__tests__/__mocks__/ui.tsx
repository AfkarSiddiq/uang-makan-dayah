import React from 'react';

export function MockButton({ children, onClick, disabled, type, className, variant, size, ...props }: any) {
    return (
        <button onClick={onClick} disabled={disabled} type={type || 'button'} className={className} data-variant={variant} data-size={size} {...props}>
            {children}
        </button>
    );
}

export function MockInput({ className, value, onChange, placeholder, type, disabled, ...props }: any) {
    return (
        <input
            className={className}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            type={type || 'text'}
            disabled={disabled}
            {...props}
        />
    );
}

export function MockLabel({ children, htmlFor, className, ...props }: any) {
    return <label htmlFor={htmlFor} className={className} {...props}>{children}</label>;
}

export function MockSelect({ value, onValueChange, disabled, children, ...props }: any) {
    const opts: { value: string; label: string; disabled?: boolean }[] = [];
    const textChildren: string[] = [];
    React.Children.forEach(children, (child: any) => {
        if (child?.type?.displayName === 'SelectTrigger') {
            React.Children.forEach(child.props?.children, (c: any) => {
                if (c?.type?.displayName === 'SelectValue') {
                    textChildren.push(c.props?.placeholder || '');
                }
            });
        }
        if (child?.type?.displayName === 'SelectContent') {
            React.Children.forEach(child.props?.children, (item: any) => {
                if (item?.type?.displayName === 'SelectItem') {
                    opts.push({ value: item.props.value, label: item.props.children, disabled: item.props.disabled });
                }
            });
        }
    });

    return (
        <select
            value={value || ''}
            onChange={(e) => onValueChange?.(e.target.value)}
            disabled={disabled}
            data-testid="mock-select"
            {...props}
        >
            {value === undefined && <option value="" disabled>{textChildren[0] || 'Pilih'}</option>}
            {opts.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

(MockSelect as any).displayName = 'Select';

export function MockSelectTrigger({ children, ...props }: any) {
    return <div {...props}>{children}</div>;
}
(MockSelectTrigger as any).displayName = 'SelectTrigger';

export function MockSelectValue({ placeholder }: any) {
    return <span>{placeholder}</span>;
}
(MockSelectValue as any).displayName = 'SelectValue';

export function MockSelectContent({ children }: any) {
    return <div>{children}</div>;
}
(MockSelectContent as any).displayName = 'SelectContent';

export function MockSelectItem({ children, value, disabled }: any) {
    return <div data-value={value} data-disabled={disabled}>{children}</div>;
}
(MockSelectItem as any).displayName = 'SelectItem';

export function MockSelectGroup({ children }: any) {
    return <div>{children}</div>;
}

export function MockPopover({ children }: any) {
    return <div>{children}</div>;
}

export function MockPopoverTrigger({ children, asChild, ...props }: any) {
    return <div {...props}>{children}</div>;
}

export function MockPopoverContent({ children, ...props }: any) {
    return <div {...props}>{children}</div>;
}

export function MockCalendar({ mode, selected, onSelect, ...props }: any) {
    return (
        <div data-testid="mock-calendar">
            <input
                type="date"
                value={selected ? selected.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                    if (onSelect && e.target.value) {
                        onSelect(new Date(e.target.value));
                    }
                }}
            />
        </div>
    );
}
