<?php

namespace Database\Seeders;

use App\Models\AkunKeuangan;
use Illuminate\Database\Seeder;

class AkunKeuanganSeeder extends Seeder
{
    public function run(): void
    {
        AkunKeuangan::updateOrCreate(
            ['nama' => 'Uang Cash'],
            [
                'jenis' => 'cash',
                'saldo_awal' => 0,
                'aktif' => true,
            ]
        );

        AkunKeuangan::updateOrCreate(
            ['nama' => 'ATM'],
            [
                'jenis' => 'bank',
                'saldo_awal' => 0,
                'aktif' => true,
            ]
        );
    }
}
