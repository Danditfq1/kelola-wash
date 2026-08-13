<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransaksiKeuanganController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::get('keuangan', [TransaksiKeuanganController::class, 'index'])
        ->name('keuangan.index');

    Route::post('keuangan', [TransaksiKeuanganController::class, 'store'])
        ->name('keuangan.store');
});

require __DIR__.'/settings.php';
