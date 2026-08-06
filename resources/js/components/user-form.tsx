import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface UserFormProps {
    roles: Role[];
    initial: {
        name: string;
        email: string;
        roles: number[];
    };
    title: string;
    description: string;
    submitLabel: string;
    submitUrl: string;
    submitMethod: 'post' | 'put';
    passwordRequired?: boolean;
}

function UserForm({ roles, initial, title, description, submitLabel, submitUrl, submitMethod, passwordRequired = true }: UserFormProps) {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        name: initial.name,
        email: initial.email,
        password: '',
        password_confirmation: '',
        roles: initial.roles,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router[submitMethod](submitUrl, form, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
        });
    };

    return (
        <div className="mx-auto max-w-2xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
            <BackButton href="/users">Pengguna</BackButton>

            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-4 sm:p-6 max-w-xl w-full shadow-sm">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs sm:text-sm">Nama Lengkap *</Label>
                    <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                        className="h-11 sm:h-10 w-full"
                    />
                    {errors.name && <p className="text-sm text-rose-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm">Email *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="nama@email.com"
                        className="h-11 sm:h-10 w-full"
                    />
                    {errors.email && <p className="text-sm text-rose-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs sm:text-sm">{passwordRequired ? 'Password *' : 'Password Baru'}</Label>
                    <PasswordInput
                        id="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder={passwordRequired ? 'Minimal 8 karakter' : 'Kosongkan jika tidak ingin mengubah'}
                        autoComplete="new-password"
                        className="h-11 sm:h-10 w-full"
                    />
                    {!passwordRequired && (
                        <p className="text-xs text-muted-foreground">
                            Minimal 8 karakter. Kosongkan jika tidak ingin mengubah password.
                        </p>
                    )}
                    {errors.password && <p className="text-sm text-rose-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-xs sm:text-sm">{passwordRequired ? 'Konfirmasi Password *' : 'Konfirmasi Password Baru'}</Label>
                    <PasswordInput
                        id="password_confirmation"
                        value={form.password_confirmation}
                        onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                        placeholder="Ulangi password"
                        autoComplete="new-password"
                        className="h-11 sm:h-10 w-full"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs sm:text-sm">Role *</Label>
                    <Select
                        value={form.roles[0]?.toString() || ''}
                        onValueChange={(value) => {
                            setForm({ ...form, roles: value ? [Number(value)] : [] });
                        }}
                    >
                        <SelectTrigger id="role" className="h-11 sm:h-10 w-full">
                            <SelectValue placeholder="Pilih role pengguna" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()} className="text-xs sm:text-sm">
                                    {role.display_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {(errors.roles || errors['roles.0']) && (
                        <p className="text-sm text-rose-500">{errors.roles || errors['roles.0']}</p>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-2.5 pt-4 sm:flex-row sm:gap-3 border-t border-border dark:border-slate-800">
                    <Button type="button" variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-10">
                        <Link href="/users">Batal</Link>
                    </Button>
                    <Button type="submit" disabled={processing} className="w-full sm:w-auto h-11 sm:h-10">
                        {processing ? 'Menyimpan...' : submitLabel}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export { UserForm };
