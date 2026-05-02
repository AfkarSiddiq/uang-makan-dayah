import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

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

    const renderCategoryList = (title: string, list: Category[], typeLabel: string) => (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            {list.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada kategori</p>
            ) : (
                <ul className="space-y-2">
                    {list.map((category) => (
                        <li
                            key={category.id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                        >
                            {editingId === category.id ? (
                                <div className="flex flex-1 gap-2">
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1"
                                    />
                                    <select
                                        value={editType}
                                        onChange={(e) => setEditType(e.target.value as 'in' | 'out' | 'both')}
                                        className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-700"
                                    >
                                        <option value="in">Pemasukan</option>
                                        <option value="out">Pengeluaran</option>
                                        <option value="both">Kedua</option>
                                    </select>
                                    <Button size="sm" onClick={() => handleUpdate(category.id)}>
                                        Simpan
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium text-slate-700 dark:text-slate-200">
                                        {category.name}
                                    </span>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleEdit(category)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-rose-600 hover:bg-rose-50"
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kategori Transaksi</h1>
                    <p className="text-sm text-slate-500">Kelola kategori pemasukan dan pengeluaran</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                        Tambah Kategori Baru
                    </h2>
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                placeholder="Nama kategori"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}
                        </div>
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value as 'in' | 'out' | 'both')}
                            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                        >
                            <option value="in">Pemasukan</option>
                            <option value="out">Pengeluaran</option>
                            <option value="both">Kedua</option>
                        </select>
                        <Button type="submit" disabled={processing || !data.name}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah
                        </Button>
                    </form>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {renderCategoryList('Pemasukan', categories.in || [], 'Pemasukan')}
                    {renderCategoryList('Pengeluaran', categories.out || [], 'Pengeluaran')}
                    {renderCategoryList('Kedua', categories.both || [], 'Kedua')}
                </div>
            </div>
        </AppLayout>
    );
}