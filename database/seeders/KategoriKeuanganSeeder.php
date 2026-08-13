<?php

namespace Database\Seeders;

use App\Models\KategoriKeuangan;
use Illuminate\Database\Seeder;

class KategoriKeuanganSeeder extends Seeder
{
    public function run(): void
    {
        $kategori = [
            [
                'nama' => 'Pembayaran Customer',
                'jenis' => 'pemasukan',
            ],
            [
                'nama' => 'Pendapatan Lain',
                'jenis' => 'pemasukan',
            ],
            [
                'nama' => 'Bahan Washing',
                'jenis' => 'pengeluaran',
            ],
            [
                'nama' => 'Gaji Karyawan',
                'jenis' => 'pengeluaran',
            ],
            [
                'nama' => 'Listrik',
                'jenis' => 'pengeluaran',
            ],
            [
                'nama' => 'Air',
                'jenis' => 'pengeluaran',
            ],
            [
                'nama' => 'Transportasi',
                'jenis' => 'pengeluaran',
            ],
            [
                'nama' => 'Lain-lain',
                'jenis' => 'pengeluaran',
            ],
        ];

        foreach ($kategori as $item) {
            KategoriKeuangan::updateOrCreate(
                [
                    'nama' => $item['nama'],
                    'jenis' => $item['jenis'],
                ],
                [
                    'aktif' => true,
                ]
            );
        }
    }
}
