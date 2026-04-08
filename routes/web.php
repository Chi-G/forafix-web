<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/api/debug-path', function () {
    return response()->json([
        'path' => request()->path(),
        'url' => request()->fullUrl(),
        'method' => request()->method(),
    ]);
});

Route::redirect('/dashboard', '/cl/find-service');
Route::redirect('/cl/find-work', '/cl/find-service');
Route::redirect('/search', '/cl/find-service');

Route::get('{any}', function () {
    return view('welcome');
})->where('any', '^(?!(api|forafix/api)).*');
