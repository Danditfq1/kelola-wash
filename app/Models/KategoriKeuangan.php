<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriKeuangan extends Model
{
    protected $table = 'kategori_keuangan';

    protected $fillable = [
        'nama',
        'jenis',
        'aktif',
    ];

    protected function casts(): array
    {
        return [
            'aktif' => 'boolean',
        ];
    }

    public function transaksi(): HasMany
    {
        return $this->hasMany(
            TransaksiKeuangan::class,
            'kategori_id'
        );
    }
}
