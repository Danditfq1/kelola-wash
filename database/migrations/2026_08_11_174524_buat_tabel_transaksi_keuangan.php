<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksi_keuangan', function (Blueprint $table) {
            $table->id();

            $table->date('tanggal');

            // pemasukan / pengeluaran / pemindahan
            $table->string('jenis', 20);

            $table->foreignId('kategori_id')
                ->nullable()
                ->constrained('kategori_keuangan')
                ->restrictOnDelete();

            $table->foreignId('akun_asal_id')
                ->nullable()
                ->constrained('akun_keuangan')
                ->restrictOnDelete();

            $table->foreignId('akun_tujuan_id')
                ->nullable()
                ->constrained('akun_keuangan')
                ->restrictOnDelete();

            $table->string('keterangan', 255)->nullable();

            $table->decimal('nominal', 15, 2);

            $table->timestamps();

            $table->index('tanggal');
            $table->index('jenis');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_keuangan');
    }
};
