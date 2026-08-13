<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransaksiKeuangan extends Model
{
    protected $table = 'transaksi_keuangan';

    protected $fillable = [
        'tanggal',
        'jenis',
        'kategori_id',
        'akun_asal_id',
        'akun_tujuan_id',
        'keterangan',
        'nominal',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'nominal' => 'decimal:2',
        ];
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(
            KategoriKeuangan::class,
            'kategori_id'
        );
    }

    public function akunAsal(): BelongsTo
    {
        return $this->belongsTo(
            AkunKeuangan::class,
            'akun_asal_id'
        );
    }

    public function akunTujuan(): BelongsTo
    {
        return $this->belongsTo(
            AkunKeuangan::class,
            'akun_tujuan_id'
        );
    }
}
