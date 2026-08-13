import { Head } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

type Akun = {
    id: number;
    nama: string;
    jenis: string;
    saldo_awal: string;
    saldo_saat_ini: number;
};

type RekapBulanan = {
    bulan: number;
    nama_bulan: string;
    pemasukan: number;
    pengeluaran: number;
    selisih: number;
};

type Kategori = {
    id: number;
    nama: string;
};

type AkunRingkas = {
    id: number;
    nama: string;
};

type Transaksi = {
    id: number;
    tanggal: string;
    jenis: 'pemasukan' | 'pengeluaran' | 'pemindahan';
    nominal: string;
    keterangan: string | null;

    kategori?: Kategori | null;
    akun_asal?: AkunRingkas | null;
    akun_tujuan?: AkunRingkas | null;
};

type Props = {
    akun: Akun[];

    ringkasan: {
        pemasukan_bulan: number;
        pengeluaran_bulan: number;
        selisih_bulan: number;

        pemasukan_tahun: number;
        pengeluaran_tahun: number;
        selisih_tahun: number;
    };

    rekap_tahunan: RekapBulanan[];

    transaksi_terakhir: Transaksi[];

    periode: {
        bulan: string;
        tahun: number;
    };
};

const rupiah = (nominal: number | string) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(nominal));
};

const formatTanggal = (tanggal: string) => {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(tanggal));
};

export default function Dashboard({
    akun,
    ringkasan,
    rekap_tahunan,
    transaksi_terakhir,
    periode,
}: Props) {
    const totalSaldo = akun.reduce(
        (total, item) => total + Number(item.saldo_saat_ini),
        0,
    );

    const nilaiGrafikTerbesar = Math.max(
        ...rekap_tahunan.flatMap((item) => [
            item.pemasukan,
            item.pengeluaran,
        ]),
        1,
    );

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Ringkasan keuangan Serajaya Wash bulan{' '}
                        {periode.bulan} {periode.tahun}.
                    </p>
                </div>

                {/* Saldo */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {akun.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-xl border bg-card p-5 shadow-sm"
                        >
                            <p className="text-sm font-medium text-muted-foreground">
                                Saldo {item.nama}
                            </p>

                            <p className="mt-3 text-2xl font-semibold tracking-tight">
                                {rupiah(item.saldo_saat_ini)}
                            </p>
                        </div>
                    ))}

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <p className="text-sm font-medium text-muted-foreground">
                            Total Saldo
                        </p>

                        <p className="mt-3 text-2xl font-semibold tracking-tight">
                            {rupiah(totalSaldo)}
                        </p>
                    </div>
                </div>

                {/* Bulan ini */}
                <div>
                    <div className="mb-3">
                        <h2 className="text-lg font-semibold">
                            Bulan Ini
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border bg-card p-5">
                            <p className="text-sm text-muted-foreground">
                                Pemasukan
                            </p>

                            <p className="mt-3 text-2xl font-semibold">
                                {rupiah(ringkasan.pemasukan_bulan)}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-card p-5">
                            <p className="text-sm text-muted-foreground">
                                Pengeluaran
                            </p>

                            <p className="mt-3 text-2xl font-semibold">
                                {rupiah(ringkasan.pengeluaran_bulan)}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-card p-5">
                            <p className="text-sm text-muted-foreground">
                                Selisih
                            </p>

                            <p className="mt-3 text-2xl font-semibold">
                                {rupiah(ringkasan.selisih_bulan)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grafik */}
                <div className="rounded-xl border bg-card p-5">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold">
                            Grafik Keuangan {periode.tahun}
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Perbandingan pemasukan dan pengeluaran
                            setiap bulan.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="flex min-w-[750px] items-end gap-4">
                            {rekap_tahunan.map((item) => {
                                const tinggiPemasukan =
                                    (item.pemasukan /
                                        nilaiGrafikTerbesar) *
                                    180;

                                const tinggiPengeluaran =
                                    (item.pengeluaran /
                                        nilaiGrafikTerbesar) *
                                    180;

                                return (
                                    <div
                                        key={item.bulan}
                                        className="flex flex-1 flex-col items-center"
                                    >
                                        <div className="flex h-[190px] items-end gap-1.5">
                                            <div
                                                title={`Pemasukan ${rupiah(
                                                    item.pemasukan,
                                                )}`}
                                                className="w-4 rounded-t bg-emerald-500"
                                                style={{
                                                    height:
                                                        tinggiPemasukan > 0
                                                            ? `${tinggiPemasukan}px`
                                                            : '2px',
                                                }}
                                            />

                                            <div
                                                title={`Pengeluaran ${rupiah(
                                                    item.pengeluaran,
                                                )}`}
                                                className="w-4 rounded-t bg-rose-500"
                                                style={{
                                                    height:
                                                        tinggiPengeluaran > 0
                                                            ? `${tinggiPengeluaran}px`
                                                            : '2px',
                                                }}
                                            />
                                        </div>

                                        <span className="mt-2 text-xs text-muted-foreground">
                                            {item.nama_bulan}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-5 flex gap-5 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                            Pemasukan
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-sm bg-rose-500" />
                            Pengeluaran
                        </div>
                    </div>
                </div>

                {/* Rekap tahunan */}
                <div className="overflow-hidden rounded-xl border bg-card">
                    <div className="border-b p-5">
                        <h2 className="text-lg font-semibold">
                            Rekap {periode.tahun}
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="px-5 py-3 text-left font-medium">
                                        Bulan
                                    </th>

                                    <th className="px-5 py-3 text-right font-medium">
                                        Pemasukan
                                    </th>

                                    <th className="px-5 py-3 text-right font-medium">
                                        Pengeluaran
                                    </th>

                                    <th className="px-5 py-3 text-right font-medium">
                                        Selisih
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {rekap_tahunan.map((item) => (
                                    <tr
                                        key={item.bulan}
                                        className="border-b"
                                    >
                                        <td className="px-5 py-3">
                                            {item.nama_bulan}
                                        </td>

                                        <td className="px-5 py-3 text-right">
                                            {rupiah(item.pemasukan)}
                                        </td>

                                        <td className="px-5 py-3 text-right">
                                            {rupiah(item.pengeluaran)}
                                        </td>

                                        <td className="px-5 py-3 text-right font-medium">
                                            {rupiah(item.selisih)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            <tfoot>
                                <tr className="bg-muted/50 font-semibold">
                                    <td className="px-5 py-4">
                                        Total {periode.tahun}
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        {rupiah(
                                            ringkasan.pemasukan_tahun,
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        {rupiah(
                                            ringkasan.pengeluaran_tahun,
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        {rupiah(
                                            ringkasan.selisih_tahun,
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Transaksi terakhir */}
                <div className="overflow-hidden rounded-xl border bg-card">
                    <div className="border-b p-5">
                        <h2 className="text-lg font-semibold">
                            Transaksi Terakhir
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="px-5 py-3 text-left">
                                        Tanggal
                                    </th>

                                    <th className="px-5 py-3 text-left">
                                        Jenis
                                    </th>

                                    <th className="px-5 py-3 text-left">
                                        Keterangan
                                    </th>

                                    <th className="px-5 py-3 text-left">
                                        Akun
                                    </th>

                                    <th className="px-5 py-3 text-right">
                                        Nominal
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {transaksi_terakhir.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-10 text-center text-muted-foreground"
                                        >
                                            Belum ada transaksi keuangan.
                                        </td>
                                    </tr>
                                )}

                                {transaksi_terakhir.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-none"
                                    >
                                        <td className="px-5 py-3">
                                            {formatTanggal(item.tanggal)}
                                        </td>

                                        <td className="px-5 py-3 capitalize">
                                            {item.jenis}
                                        </td>

                                        <td className="px-5 py-3">
                                            {item.keterangan ||
                                                item.kategori?.nama ||
                                                '-'}
                                        </td>

                                        <td className="px-5 py-3">
                                            {item.jenis === 'pemasukan' &&
                                                (item.akun_tujuan?.nama ??
                                                    '-')}

                                            {item.jenis ===
                                                'pengeluaran' &&
                                                (item.akun_asal?.nama ??
                                                    '-')}

                                            {item.jenis === 'pemindahan' &&
                                                `${
                                                    item.akun_asal?.nama ??
                                                    '-'
                                                } → ${
                                                    item.akun_tujuan
                                                        ?.nama ?? '-'
                                                }`}
                                        </td>

                                        <td className="px-5 py-3 text-right font-medium">
                                            {rupiah(item.nominal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
