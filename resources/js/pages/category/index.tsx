import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface Category {
    id: number;
    name: string;
    type: 'in' | 'out' | 'both';
}

interface Props {
    categories: {
        in: Category[];
        out: Category[];
        both: Category[];
    };
}

export default function Index({ categories }: Props) {
    const { can } = usePermissions();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'in' as 'in' | 'out' | 'both',
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState<'in' | 'out' | 'both'>('in');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('category.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setEditName(category.name);
        setEditType(category.type);
    };

    const handleUpdate = (id: number) => {
        router.put(route('category.update', id), {
            name: editName,
            type: editType,
        }, {
            onSuccess: () => {
                setEditingId(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus kategori ini?')) {
            router.delete(route('category.destroy', id));
        }
    };

    const renderCategoryList = (title: string, list: Category[]) => (
        <div className="rounded-xl border border-border bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-card">
            <h2 className="mb-4 text-base sm:text-lg font-semibold text-foreground dark:text-white">{title}</h2>
            {list.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada kategori</p>
            ) : (
                <ul className="space-y-2">
                    {list.map((category) => (
                        <li
                            key={category.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-slate-50 p-3 gap-2 dark:border-border dark:bg-slate-800"
                        >
                            {editingId === category.id ? (
                                <div className="flex flex-col sm:flex-row flex-1 gap-2 w-full">
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 h-10"
                                    />
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={editType}
                                            onChange={(e) => setEditType(e.target.value as 'in' | 'out' | 'both')}
                                            className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                        >
                                            <option value="in">Pemasukan</option>
                                            <option value="out">Pengeluaran</option>
                                            <option value="both">Kedua</option>
                                        </select>
                                        {can('kategori.edit') && (
                                            <Button size="sm" onClick={() => handleUpdate(category.id)}>
                                                Simpan
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium text-foreground/90 dark:text-slate-200">
                                        {category.name}
                                    </span>
                                    <div className="flex gap-1 justify-end">
                                        {can('kategori.edit') && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(category)}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                        {can('kategori.delete') && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-rose-600 hover:bg-rose-50"
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Kategori', href: '/category' }]}>
            <Head title="Kategori" />

            <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">Kategori Transaksi</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">Kelola kategori pemasukan dan pengeluaran</p>
                </div>

                {can('kategori.create') && (
                    <div className="rounded-xl border border-border bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-card">
                        <h2 className="mb-4 text-base sm:text-lg font-semibold text-foreground dark:text-white">
                            Tambah Kategori Baru
                        </h2>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Nama kategori"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="h-11 sm:h-10 w-full"
                                />
                                {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}
                            </div>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value as 'in' | 'out' | 'both')}
                                className="h-11 sm:h-10 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            >
                                <option value="in">Pemasukan</option>
                                <option value="out">Pengeluaran</option>
                                <option value="both">Kedua (Pemasukan & Pengeluaran)</option>
                            </select>
                            <Button type="submit" disabled={processing || !data.name} className="h-11 sm:h-10 w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Kategori
                            </Button>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                    {renderCategoryList('Pemasukan', categories.in || [])}
                    {renderCategoryList('Pengeluaran', categories.out || [])}
                    {renderCategoryList('Kedua', categories.both || [])}
                </div>
            </div>
        </AppLayout>
    );
}