<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Ici, on redirige absolument TOUT le trafic vers notre application React.
| C'est React qui gérera l'affichage et la navigation.
| Laravel ne sert plus qu'à fournir les données via api.php.
*/

Route::get('/{any}', function () {
    return view('react_app');
})->where('any', '.*');