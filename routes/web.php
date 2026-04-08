<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-route', function () {
    return response()->json([
        'path' => request()->path(),
        'uri' => request()->getRequestUri(),
        'base' => request()->getBaseUrl(),
    ]);
});

Route::redirect('/dashboard', '/cl/find-service');
Route::redirect('/cl/find-work', '/cl/find-service');
Route::redirect('/search', '/cl/find-service');

Route::get('{any}', function () {
    return view('welcome');
})->where('any', '^(?!(api|forafix/api)).*');
