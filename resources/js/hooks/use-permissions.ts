import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const permissions = (usePage().props.auth as { permissions?: string[] } | undefined)?.permissions ?? [];

    const can = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    const canAny = (...perms: string[]): boolean => {
        return perms.some((p) => permissions.includes(p));
    };

    return { can, canAny, permissions };
}
