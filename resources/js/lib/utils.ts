import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Mengubah angka/string menjadi format Rupiah dengan titik untuk ribuan/jutaan.
 * Contoh: 1500000 -> "1.500.000"
 */
export function formatNumberToRupiah(value: number | string | undefined | null): string {
    if (value === undefined || value === null || value === '') return '';
    const numberString = String(value).replace(/[^,\d]/g, '').toString();
    if (!numberString) return '';
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        const separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah;
}

/**
 * Mengubah string format Rupiah ("1.500.000") menjadi angka murni (1500000).
 */
export function parseRupiahToNumber(value: string): number {
    const clean = value.replace(/\./g, '');
    if (clean === '' || isNaN(Number(clean))) return 0;
    return parseInt(clean, 10);
}

/**
 * Mengubah string format Rupiah ("1.500.000") menjadi string angka murni ("1500000").
 */
export function parseRupiahToString(value: string): string {
    let clean = value.replace(/\./g, '');
    if (clean === '' || isNaN(Number(clean))) return '';
    if (clean.length > 1 && clean.startsWith('0')) {
        clean = clean.substring(1);
    }
    return clean;
}
