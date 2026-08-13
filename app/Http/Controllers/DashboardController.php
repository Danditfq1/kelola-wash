<?php

namespace App\Http\Controllers;

use App\Models\AkunKeuangan;
use App\Models\TransaksiKeuangan;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $sekarang = Carbon::now();

        $bulan = $sekarang->month;
        $tahun = $sekarang->year;

        /*
        |--------------------------------------------------------------------------
        | Saldo Akun Saat Ini
        |--------------------------------------------------------------------------
        |
        | saldo awal
        | + semua uang masuk
        | - semua uang keluar
        |
        */

        $akun = AkunKeuangan::where('aktif', true)
            ->orderBy('id')
            ->get()
            ->map(function ($akun) {
                $totalMasuk = TransaksiKeuangan::where(
                    'akun_tujuan_id',
                    $akun->id
                )->sum('nominal');

                $totalKeluar = TransaksiKeuangan::where(
                    'akun_asal_id',
                    $akun->id
                )->sum('nominal');

                $akun->saldo_saat_ini =
                    (float) $akun->saldo_awal
                    + (float) $totalMasuk
                    - (float) $totalKeluar;

                return $akun;
            });

        /*
        |--------------------------------------------------------------------------
        | Ringkasan Bulan Ini
        |--------------------------------------------------------------------------
        */

        $pemasukanBulan = TransaksiKeuangan::where('jenis', 'pemasukan')
            ->whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->sum('nominal');

        $pengeluaranBulan = TransaksiKeuangan::where('jenis', 'pengeluaran')
            ->whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->sum('nominal');

        $selisihBulan =
            (float) $pemasukanBulan
            - (float) $pengeluaranBulan;

        /*
        |--------------------------------------------------------------------------
        | Rekap 12 Bulan
        |--------------------------------------------------------------------------
        */

        $namaBulan = [
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'Mei',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Agu',
            9 => 'Sep',
            10 => 'Okt',
            11 => 'Nov',
            12 => 'Des',
        ];

        $rekapTahunan = collect(range(1, 12))
            ->map(function ($nomorBulan) use ($tahun, $namaBulan) {
                $pemasukan = TransaksiKeuangan::where(
                    'jenis',
                    'pemasukan'
                )
                    ->whereYear('tanggal', $tahun)
                    ->whereMonth('tanggal', $nomorBulan)
                    ->sum('nominal');

                $pengeluaran = TransaksiKeuangan::where(
                    'jenis',
                    'pengeluaran'
                )
                    ->whereYear('tanggal', $tahun)
                    ->whereMonth('tanggal', $nomorBulan)
                    ->sum('nominal');

                return [
                    'bulan' => $nomorBulan,
                    'nama_bulan' => $namaBulan[$nomorBulan],
                    'pemasukan' => (float) $pemasukan,
                    'pengeluaran' => (float) $pengeluaran,
                    'selisih' =>
                        (float) $pemasukan
                        - (float) $pengeluaran,
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | Total Tahun
        |--------------------------------------------------------------------------
        */

        $totalPemasukanTahun = $rekapTahunan->sum('pemasukan');

        $totalPengeluaranTahun = $rekapTahunan->sum('pengeluaran');

        $totalSelisihTahun =
            $totalPemasukanTahun
            - $totalPengeluaranTahun;

        /*
        |--------------------------------------------------------------------------
        | Transaksi Terakhir
        |--------------------------------------------------------------------------
        */

        $transaksiTerakhir = TransaksiKeuangan::with([
            'kategori',
            'akunAsal',
            'akunTujuan',
        ])
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        return Inertia::render('dashboard', [
            'akun' => $akun,

            'ringkasan' => [
                'pemasukan_bulan' => (float) $pemasukanBulan,
                'pengeluaran_bulan' => (float) $pengeluaranBulan,
                'selisih_bulan' => $selisihBulan,

                'pemasukan_tahun' => $totalPemasukanTahun,
                'pengeluaran_tahun' => $totalPengeluaranTahun,
                'selisih_tahun' => $totalSelisihTahun,
            ],

            'rekap_tahunan' => $rekapTahunan,

            'transaksi_terakhir' => $transaksiTerakhir,

            'periode' => [
                'bulan' => $sekarang->translatedFormat('F'),
                'tahun' => $tahun,
            ],
        ]);
    }
}
