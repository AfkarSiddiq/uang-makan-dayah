import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: () => void;
    onClear?: () => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    showButton?: boolean;
}

function SearchInput({
    value,
    onChange,
    onSubmit,
    onClear,
    placeholder = 'Cari...',
    className,
    disabled = false,
    showButton = false,
}: SearchInputProps) {
    return (
        <div className={cn('relative flex-1', className)}>
            <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={placeholder}
                        className="pl-9 pr-8"
                        value={value}
                        disabled={disabled}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && onSubmit) {
                                onSubmit();
                            }
                        }}
                    />
                    {value && onClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                {showButton && (
                    <Button type="button" onClick={onSubmit} disabled={disabled} size="sm">
                        <Search className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

export { SearchInput };
