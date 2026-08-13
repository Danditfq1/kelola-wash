import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useMemo } from 'react';

type Akun = {
    id: number;
    nama: string;
    jenis: string;
    saldo_awal: string;
    aktif: boolean;
};

type Kategori = {
    id: number;
    nama: string;
    jenis: 'pemasukan' | 'pengeluaran';
    aktif: boolean;
};

type Transaksi = {
    id: number;
    tanggal: string;
    jenis: 'pemasukan' | 'pengeluaran' | 'pemindahan';
    kategori_id: number | null;
    akun_asal_id: number | null;
    akun_tujuan_id: number | null;
    keterangan: string | null;
    nominal: string;

    kategori?: Kategori | null;
    akun_asal?: Akun | null;
    akun_tujuan?: Akun | null;
};

type Props = {
    akun: Akun[];
    kategori: Kategori[];
    transaksi: Transaksi[];
};

const formatRupiah = (nilai: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(nilai);
};

const tanggalHariIni = () => {
    const sekarang = new Date();

    const tahun = sekarang.getFullYear();
    const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
    const tanggal = String(sekarang.getDate()).padStart(2, '0');

    return `${tahun}-${bulan}-${tanggal}`;
};

export default function Index({
    akun,
    kategori,
    transaksi,
}: Props) {
    const form = useForm({
        tanggal: tanggalHariIni(),
        jenis: 'pemasukan' as
            | 'pemasukan'
            | 'pengeluaran'
            | 'pemindahan',

        kategori_id: '',
        akun_asal_id: '',
        akun_tujuan_id: '',
        keterangan: '',
        nominal: '',
    });

    const kategoriTersedia = kategori.filter((item) => {
        if (form.data.jenis === 'pemindahan') {
            return false;
        }

        return item.jenis === form.data.jenis;
    });

    const saldoAkun = (akunId: number) => {
        const dataAkun = akun.find((item) => item.id === akunId);

        let saldo = Number(dataAkun?.saldo_awal ?? 0);

        transaksi.forEach((item) => {
            const nominal = Number(item.nominal);

            if (item.akun_tujuan_id === akunId) {
                saldo += nominal;
            }

            if (item.akun_asal_id === akunId) {
                saldo -= nominal;
            }
        });

        return saldo;
    };

    const ringkasanBulanIni = useMemo(() => {
        const sekarang = new Date();

        const tahun = sekarang.getFullYear();
        const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');

        const periode = `${tahun}-${bulan}`;

        let pemasukan = 0;
        let pengeluaran = 0;

        transaksi.forEach((item) => {
            if (!item.tanggal.startsWith(periode)) {
                return;
            }

            if (item.jenis === 'pemasukan') {
                pemasukan += Number(item.nominal);
            }

            if (item.jenis === 'pengeluaran') {
                pengeluaran += Number(item.nominal);
            }
        });

        return {
            pemasukan,
            pengeluaran,
            selisih: pemasukan - pengeluaran,
        };
    }, [transaksi]);

    const simpan = (e: FormEvent) => {
        e.preventDefault();

        form.post('/keuangan', {
            preserveScroll: true,

            onSuccess: () => {
                form.reset(
                    'kategori_id',
                    'akun_asal_id',
                    'akun_tujuan_id',
                    'keterangan',
                    'nominal',
                );
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Keuangan" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Pencatatan Keuangan
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Catat pemasukan, pengeluaran, dan pemindahan saldo.
                    </p>
                </div>

                {/* Saldo akun */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {akun.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-xl border bg-card p-5"
                        >
                            <p className="text-sm text-muted-foreground">
                                Saldo {item.nama}
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {formatRupiah(saldoAkun(item.id))}
                            </p>
                        </div>
                    ))}

                    <div className="rounded-xl border bg-card p-5">
                        <p className="text-sm text-muted-foreground">
                            Pemasukan Bulan Ini
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                            {formatRupiah(
                                ringkasanBulanIni.pemasukan,
                            )}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <p className="text-sm text-muted-foreground">
                            Pengeluaran Bulan Ini
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                            {formatRupiah(
                                ringkasanBulanIni.pengeluaran,
                            )}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <p className="text-sm text-muted-foreground">
                            Selisih Bulan Ini
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                            {formatRupiah(
                                ringkasanBulanIni.selisih,
                            )}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="rounded-xl border bg-card p-5">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold">
                            Tambah Transaksi
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Masukkan transaksi keuangan baru.
                        </p>
                    </div>

                    <form
                        onSubmit={simpan}
                        className="grid gap-5 md:grid-cols-2"
                    >
                        {/* Tanggal */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Tanggal
                            </label>

                            <input
                                type="date"
                                value={form.data.tanggal}
                                onChange={(e) =>
                                    form.setData(
                                        'tanggal',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-md border bg-background px-3 py-2"
                            />

                            {form.errors.tanggal && (
                                <p className="mt-1 text-sm text-red-500">
                                    {form.errors.tanggal}
                                </p>
                            )}
                        </div>

                        {/* Jenis */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Jenis Transaksi
                            </label>

                            <select
                                value={form.data.jenis}
                                onChange={(e) => {
                                    const jenis = e.target.value as
                                        | 'pemasukan'
                                        | 'pengeluaran'
                                        | 'pemindahan';

                                    form.setData((data) => ({
                                        ...data,
                                        jenis,
                                        kategori_id: '',
                                        akun_asal_id: '',
                                        akun_tujuan_id: '',
                                    }));
                                }}
                                className="w-full rounded-md border bg-background px-3 py-2"
                            >
                                <option value="pemasukan">
                                    Pemasukan
                                </option>

                                <option value="pengeluaran">
                                    Pengeluaran
                                </option>

                                <option value="pemindahan">
                                    Pemindahan Saldo
                                </option>
                            </select>
                        </div>

                        {/* Kategori */}
                        {form.data.jenis !== 'pemindahan' && (
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Kategori
                                </label>

                                <select
                                    value={form.data.kategori_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'kategori_id',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                >
                                    <option value="">
                                        Pilih kategori
                                    </option>

                                    {kategoriTersedia.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.nama}
                                        </option>
                                    ))}
                                </select>

                                {form.errors.kategori_id && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {form.errors.kategori_id}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Akun pemasukan */}
                        {form.data.jenis === 'pemasukan' && (
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Uang Masuk Ke
                                </label>

                                <select
                                    value={form.data.akun_tujuan_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'akun_tujuan_id',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                >
                                    <option value="">
                                        Pilih akun
                                    </option>

                                    {akun.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.nama}
                                        </option>
                                    ))}
                                </select>

                                {form.errors.akun_tujuan_id && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {form.errors.akun_tujuan_id}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Akun pengeluaran */}
                        {form.data.jenis === 'pengeluaran' && (
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Uang Diambil Dari
                                </label>

                                <select
                                    value={form.data.akun_asal_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'akun_asal_id',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                >
                                    <option value="">
                                        Pilih akun
                                    </option>

                                    {akun.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.nama}
                                        </option>
                                    ))}
                                </select>

                                {form.errors.akun_asal_id && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {form.errors.akun_asal_id}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Pemindahan */}
                        {form.data.jenis === 'pemindahan' && (
                            <>
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Dari
                                    </label>

                                    <select
                                        value={form.data.akun_asal_id}
                                        onChange={(e) =>
                                            form.setData(
                                                'akun_asal_id',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        <option value="">
                                            Pilih akun asal
                                        </option>

                                        {akun.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Ke
                                    </label>

                                    <select
                                        value={form.data.akun_tujuan_id}
                                        onChange={(e) =>
                                            form.setData(
                                                'akun_tujuan_id',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        <option value="">
                                            Pilih akun tujuan
                                        </option>

                                        {akun.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Nominal */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Nominal
                            </label>

                            <input
                                type="number"
                                min="1"
                                placeholder="Contoh: 1000000"
                                value={form.data.nominal}
                                onChange={(e) =>
                                    form.setData(
                                        'nominal',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-md border bg-background px-3 py-2"
                            />

                            {form.errors.nominal && (
                                <p className="mt-1 text-sm text-red-500">
                                    {form.errors.nominal}
                                </p>
                            )}
                        </div>

                        {/* Keterangan */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Keterangan
                            </label>

                            <input
                                type="text"
                                placeholder="Contoh: Pembayaran washing"
                                value={form.data.keterangan}
                                onChange={(e) =>
                                    form.setData(
                                        'keterangan',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-md border bg-background px-3 py-2"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Transaksi'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Riwayat */}
                <div className="overflow-hidden rounded-xl border bg-card">
                    <div className="border-b p-5">
                        <h2 className="text-lg font-semibold">
                            Riwayat Transaksi
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Tanggal
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Jenis
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Kategori
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Keterangan
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Akun
                                    </th>

                                    <th className="px-4 py-3 text-right">
                                        Nominal
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {transaksi.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            Belum ada transaksi.
                                        </td>
                                    </tr>
                                )}

                                {transaksi.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-4 py-3">
                                            {item.tanggal.slice(0, 10)}
                                        </td>

                                        <td className="px-4 py-3 capitalize">
                                            {item.jenis}
                                        </td>

                                        <td className="px-4 py-3">
                                            {item.jenis ===
                                            'pemindahan'
                                                ? '-'
                                                : item.kategori?.nama ??
                                                  '-'}
                                        </td>

                                        <td className="px-4 py-3">
                                            {item.keterangan ?? '-'}
                                        </td>

                                        <td className="px-4 py-3">
                                            {item.jenis ===
                                                'pemasukan' &&
                                                item.akun_tujuan
                                                    ?.nama}

                                            {item.jenis ===
                                                'pengeluaran' &&
                                                item.akun_asal
                                                    ?.nama}

                                            {item.jenis ===
                                                'pemindahan' &&
                                                `${item.akun_asal?.nama ?? '-'} → ${item.akun_tujuan?.nama ?? '-'}`}
                                        </td>

                                        <td className="px-4 py-3 text-right font-medium">
                                            {formatRupiah(
                                                Number(item.nominal),
                                            )}
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
