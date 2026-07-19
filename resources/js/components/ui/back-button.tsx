import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
    href?: string;
    children?: React.ReactNode;
    className?: string;
}

function BackButton({ href = route('payment.index'), children = 'Transaksi', className }: BackButtonProps) {
    return (
        <Link
            href={href}
            className={cn(
                'inline-flex items-center text-sm font-medium text-muted-foreground transition hover:text-foreground dark:hover:text-white',
                className,
            )}
        >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Kembali ke {children}
        </Link>
    );
}

export { BackButton };
