<?php

namespace App\Http\Controllers;

use App\Models\AkunKeuangan;
use App\Models\KategoriKeuangan;
use App\Models\TransaksiKeuangan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TransaksiKeuanganController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('keuangan/index', [
            'akun' => AkunKeuangan::where('aktif', true)
                ->orderBy('nama')
                ->get(),

            'kategori' => KategoriKeuangan::where('aktif', true)
                ->orderBy('nama')
                ->get(),

            'transaksi' => TransaksiKeuangan::with([
                    'kategori',
                    'akunAsal',
                    'akunTujuan',
                ])
                ->orderByDesc('tanggal')
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => [
                'required',
                'date',
            ],

            'jenis' => [
                'required',
                Rule::in([
                    'pemasukan',
                    'pengeluaran',
                    'pemindahan',
                ]),
            ],

            'kategori_id' => [
                'nullable',
                'exists:kategori_keuangan,id',
            ],

            'akun_asal_id' => [
                'nullable',
                'exists:akun_keuangan,id',
            ],

            'akun_tujuan_id' => [
                'nullable',
                'exists:akun_keuangan,id',
            ],

            'keterangan' => [
                'nullable',
                'string',
                'max:255',
            ],

            'nominal' => [
                'required',
                'numeric',
                'min:1',
            ],
        ]);

        if ($request->jenis === 'pemasukan') {
            $request->validate([
                'kategori_id' => ['required'],
                'akun_tujuan_id' => ['required'],
            ]);

            $kategori = KategoriKeuangan::findOrFail(
                $request->kategori_id
            );

            if ($kategori->jenis !== 'pemasukan') {
                return back()->withErrors([
                    'kategori_id' =>
                        'Kategori harus berjenis pemasukan.',
                ]);
            }
        }

        if ($request->jenis === 'pengeluaran') {
            $request->validate([
                'kategori_id' => ['required'],
                'akun_asal_id' => ['required'],
            ]);

            $kategori = KategoriKeuangan::findOrFail(
                $request->kategori_id
            );

            if ($kategori->jenis !== 'pengeluaran') {
                return back()->withErrors([
                    'kategori_id' =>
                        'Kategori harus berjenis pengeluaran.',
                ]);
            }
        }

        if ($request->jenis === 'pemindahan') {
            $request->validate([
                'akun_asal_id' => [
                    'required',
                    'different:akun_tujuan_id',
                ],
                'akun_tujuan_id' => [
                    'required',
                    'different:akun_asal_id',
                ],
            ]);
        }

        TransaksiKeuangan::create([
            'tanggal' => $request->tanggal,
            'jenis' => $request->jenis,

            'kategori_id' =>
                $request->jenis === 'pemindahan'
                    ? null
                    : $request->kategori_id,

            'akun_asal_id' =>
                in_array($request->jenis, [
                    'pengeluaran',
                    'pemindahan',
                ])
                    ? $request->akun_asal_id
                    : null,

            'akun_tujuan_id' =>
                in_array($request->jenis, [
                    'pemasukan',
                    'pemindahan',
                ])
                    ? $request->akun_tujuan_id
                    : null,

            'keterangan' => $request->keterangan,
            'nominal' => $request->nominal,
        ]);

        return back()->with(
            'success',
            'Transaksi berhasil disimpan.'
        );
    }
}
