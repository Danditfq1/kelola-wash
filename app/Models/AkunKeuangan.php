<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AkunKeuangan extends Model
{
    protected $table = 'akun_keuangan';

    protected $fillable = [
        'nama',
        'jenis',
        'saldo_awal',
        'aktif',
    ];

    protected function casts(): array
    {
        return [
            'saldo_awal' => 'decimal:2',
            'aktif' => 'boolean',
        ];
    }

    public function transaksiKeluar(): HasMany
    {
        return $this->hasMany(
            TransaksiKeuangan::class,
            'akun_asal_id'
        );
    }

    public function transaksiMasuk(): HasMany
    {
        return $this->hasMany(
            TransaksiKeuangan::class,
            'akun_tujuan_id'
        );
    }
}
