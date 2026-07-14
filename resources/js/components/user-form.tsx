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
        <div className="mx-auto min-w-md max-w-4xl space-y-6 p-6">
            <BackButton href="/users">Pengguna</BackButton>

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-md border bg-card p-6 max-w-xl">
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                    />
                    {errors.name && <p className="text-sm text-rose-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="nama@email.com"
                    />
                    {errors.email && <p className="text-sm text-rose-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">{passwordRequired ? 'Password *' : 'Password Baru'}</Label>
                    <PasswordInput
                        id="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder={passwordRequired ? 'Minimal 8 karakter' : 'Kosongkan jika tidak ingin mengubah'}
                        autoComplete="new-password"
                    />
                    {!passwordRequired && (
                        <p className="text-xs text-muted-foreground">
                            Minimal 8 karakter. Kosongkan jika tidak ingin mengubah password.
                        </p>
                    )}
                    {errors.password && <p className="text-sm text-rose-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">{passwordRequired ? 'Konfirmasi Password *' : 'Konfirmasi Password Baru'}</Label>
                    <PasswordInput
                        id="password_confirmation"
                        value={form.password_confirmation}
                        onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                        placeholder="Ulangi password"
                        autoComplete="new-password"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                        value={form.roles[0]?.toString() || ''}
                        onValueChange={(value) => {
                            setForm({ ...form, roles: value ? [Number(value)] : [] });
                        }}
                    >
                        <SelectTrigger id="role" className="w-full">
                            <SelectValue placeholder="Pilih role pengguna" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                    {role.display_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {(errors.roles || errors['roles.0']) && (
                        <p className="text-sm text-rose-500">{errors.roles || errors['roles.0']}</p>
                    )}
                </div>

                <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan...' : submitLabel}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/users">Batal</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
}

export { UserForm };
