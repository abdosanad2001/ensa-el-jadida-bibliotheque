<?php

use Illuminate\Support\Facades\Route;
use App\Models\Book;
use App\Models\Auther;
use App\Models\Category;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\book_issue;

// --- STATISTIQUES DU DASHBOARD ---
Route::get('/dashboard-stats', function () {
    \Illuminate\Support\Facades\DB::table('book_issues')
        ->where('issue_status', 'R')
        ->where('created_at', '<', now()->subDays(3))
        ->delete();

    $loansCount = \Illuminate\Support\Facades\DB::table('book_issues')->where('issue_status', 'N')->count();
    $reservationsCount = \Illuminate\Support\Facades\DB::table('book_issues')->where('issue_status', 'R')->count();
    $overdueCount = \Illuminate\Support\Facades\DB::table('book_issues')
        ->where('issue_status', 'N')
        ->where('return_date', '<', now())
        ->count();

    $recentActivity = \Illuminate\Support\Facades\DB::table('book_issues')
        ->join('books', 'book_issues.book_id', '=', 'books.id')
        ->join('users', 'book_issues.student_id', '=', 'users.id')
        ->select('users.name as user_name', 'books.name as book_name', 'book_issues.issue_status', 'book_issues.created_at')
        ->orderBy('book_issues.created_at', 'desc')
        ->limit(5)
        ->get();

    return response()->json([
        'cards' => [
            ['title' => 'Livres en Stock', 'count' => Book::count(), 'color' => '#2c3e50'],
            ['title' => 'Emprunts (Sortis)', 'count' => $loansCount, 'color' => '#17a2b8'],
            ['title' => 'Réservations', 'count' => $reservationsCount, 'color' => '#ffc107'],
            ['title' => 'Retards', 'count' => $overdueCount, 'color' => '#e74c3c'],
        ],
        'recentActivity' => $recentActivity
    ]);
});

// --- GESTION DES AUTEURS ---
Route::get('/authors-list', function () {
    return response()->json(Auther::all());
});
Route::post('/authors', function (Request $request) {
    $request->validate(['name' => 'required']);
    return response()->json(Auther::create(['name' => $request->name]));
});
Route::delete('/authors/{id}', function ($id) {
    Auther::find($id)?->delete();
    return response()->json(['message' => 'Supprimé']);
});

// --- GESTION DES CATÉGORIES (Corrigé !) ---
Route::get('/categories-list', function () {
    return response()->json(Category::all());
});
Route::post('/categories', function (Request $request) {
    $request->validate(['name' => 'required']);
    return response()->json(Category::create(['name' => $request->name]));
});
Route::delete('/categories/{id}', function ($id) {
    Category::find($id)?->delete();
    return response()->json(['message' => 'Supprimé']);
});

// --- GESTION DES ÉDITEURS (Corrigé !) ---
Route::get('/publishers-list', function () {
    return response()->json(\App\Models\Publisher::all());
});
Route::post('/publishers', function (Request $request) {
    $request->validate(['name' => 'required']);
    return response()->json(\App\Models\Publisher::create(['name' => $request->name]));
});
Route::delete('/publishers/{id}', function ($id) {
    \App\Models\Publisher::find($id)?->delete();
    return response()->json(['message' => 'Supprimé']);
});

// --- GESTION DES LIVRES ---
Route::get('/books-list', function () {
    return response()->json(Book::with('auther')->get());
});
Route::post('/books', function (Illuminate\Http\Request $request) {
    $request->validate([
        'name' => 'required',
        'auther_id' => 'required',
        'category_id' => 'required',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
    ]);

    $imageName = null;

    if ($request->hasFile('image')) {
        $file = $request->file('image');
        $imageName = time() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('public/covers', $imageName);
    }

    $book = Book::create([
        'name' => $request->name,
        'auther_id' => $request->auther_id,
        'category_id' => $request->category_id,
        'publisher_id' => 1,
        'cover_image' => $imageName,
    ]);

    return response()->json($book->load(['auther', 'category']));
});
Route::delete('/books/{id}', function ($id) {
    Book::find($id)?->delete();
    return response()->json(['message' => 'Supprimé']);
});

// --- GESTION DES UTILISATEURS & AUTH ---
Route::get('/students-list', function () {
    return response()->json(User::whereIn('role', [1, 2])->get());
});

// 👇 ROUTES SÉCURISÉES POUR CRÉER ET SUPPRIMER UN UTILISATEUR 👇
Route::middleware('auth:sanctum')->group(function () {

    // Route pour CRÉER un utilisateur
    Route::post('/students', function (Request $request) {

        // 1. VÉRIFICATION DU RÔLE : Seul le rôle 0 (Super Admin) a le droit
        if ((int) $request->user()->role !== 0) {
            return response()->json(['message' => 'Accès refusé : Réservé aux administrateurs.'], 403);
        }

        $request->validate([
            'name' => 'required',
            'username' => 'required|unique:users,username',
            'role' => 'required'
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'password' => Hash::make('123456'),
            'role' => (int) $request->role
        ]);

        return response()->json($user);
    });

    // Route pour SUPPRIMER un utilisateur
    Route::delete('/students/{id}', function (Request $request, $id) {

        // 1. VÉRIFICATION DU RÔLE : Seul le rôle 0 (Super Admin) a le droit
        if ((int) $request->user()->role !== 0) {
            return response()->json(['message' => 'Accès refusé : Réservé aux administrateurs.'], 403);
        }

        User::find($id)?->delete();
        return response()->json(['message' => 'Utilisateur supprimé']);
    });

});
// 👆 FIN DES ROUTES SÉCURISÉES 👆

Route::post('/login', function (Request $request) {
    // On cherche l'utilisateur par son pseudo
    $user = User::where('username', $request->username)->first();

    // On vérifie si l'utilisateur existe et si le mot de passe est correct
    if ($user && Hash::check($request->password, $user->password)) {

        // NOUVEAU : On crée un jeton d'authentification sécurisé pour cet utilisateur
        $token = $user->createToken('auth_token')->plainTextToken;

        // On renvoie les infos de l'utilisateur ET le jeton au front-end React
        return response()->json([
            'message' => 'Succès',
            'user' => $user,
            'token' => $token // C'est cette clé qui va ouvrir les portes sécurisées
        ]);
    }

    return response()->json(['message' => 'Erreur'], 401);
});

Route::post('/register', function (Request $request) {
    $user = User::create(['name' => $request->name, 'username' => $request->username, 'password' => Hash::make($request->password), 'role' => (int) $request->role]);
    return response()->json(['user' => $user]);
});

// CHANGEMENT DE MOT DE PASSE
Route::post('/change-password', function (Request $request) {
    $request->validate([
        'user_id' => 'required|exists:users,id',
        'new_password' => 'required|min:6'
    ]);

    $user = User::find($request->user_id);
    $user->update([
        'password' => Hash::make($request->new_password)
    ]);

    return response()->json(['message' => 'Votre mot de passe a été modifié avec succès !']);
});


// --- RÉSERVATION & EMPRUNTS ---
Route::post('/book-issues', function (Request $request) {
    $request->validate([
        'student_id' => 'required|exists:users,id',
        'book_id' => 'required|exists:books,id'
    ]);

    $alreadyTaken = \Illuminate\Support\Facades\DB::table('book_issues')
        ->where('book_id', $request->book_id)
        ->whereIn('issue_status', ['R', 'N'])
        ->first();

    if ($alreadyTaken) {
        $holder = User::find($alreadyTaken->student_id);
        $statusText = ($alreadyTaken->issue_status === 'R') ? "réservé" : "déjà emprunté";
        return response()->json([
            'message' => "Action impossible : ce livre est $statusText par {$holder->name}."
        ], 400);
    }

    $user = User::find($request->student_id);
    $limit = ((int) $user->role === 2) ? 5 : 2;
    $currentCount = \Illuminate\Support\Facades\DB::table('book_issues')
        ->where('student_id', $user->id)
        ->whereIn('issue_status', ['R', 'N'])
        ->count();

    if ($currentCount >= $limit) {
        return response()->json(['message' => "Quota atteint pour cet utilisateur !"], 400);
    }

    $dueDate = now()->addDays(15)->format('Y-m-d');
    $id = \Illuminate\Support\Facades\DB::table('book_issues')->insertGetId([
        'student_id' => $request->student_id,
        'book_id' => $request->book_id,
        'issue_date' => now(),
        'return_date' => $dueDate,
        'issue_status' => 'N',
        'created_at' => now(),
        'updated_at' => now()
    ]);

    $newIssue = \Illuminate\Support\Facades\DB::table('book_issues')
        ->join('users', 'book_issues.student_id', '=', 'users.id')
        ->join('books', 'book_issues.book_id', '=', 'books.id')
        ->select('book_issues.*', 'users.name as student_name', 'books.name as book_name')
        ->where('book_issues.id', $id)
        ->first();

    return response()->json($newIssue);
});

Route::post('/reserve-book', function (Request $request) {
    $studentId = $request->student_id;
    $bookId = $request->book_id;

    $user = User::find($studentId);
    if (!$user)
        return response()->json(['message' => 'Utilisateur non trouvé'], 404);

    $limit = ((int) $user->role === 2) ? 5 : 2;

    $currentLoansCount = \Illuminate\Support\Facades\DB::table('book_issues')
        ->where('student_id', $studentId)
        ->whereIn('issue_status', ['R', 'N'])
        ->count();

    if ($currentLoansCount >= $limit) {
        $type = ((int) $user->role === 2) ? "Enseignant" : "Étudiant";
        return response()->json(['message' => "Quota atteint pour votre statut de $type ! (Maximum $limit livres)"], 400);
    }

    $alreadyHas = \Illuminate\Support\Facades\DB::table('book_issues')
        ->where('student_id', $studentId)
        ->where('book_id', $bookId)
        ->whereIn('issue_status', ['N', 'R'])
        ->exists();

    if ($alreadyHas) {
        return response()->json(['message' => 'Vous avez déjà ce livre ou une réservation en cours.'], 400);
    }

    \Illuminate\Support\Facades\DB::table('book_issues')->insert([
        'student_id' => $studentId,
        'book_id' => $bookId,
        'issue_date' => now(),
        'issue_status' => 'R',
        'created_at' => now(),
        'updated_at' => now()
    ]);

    return response()->json(['message' => "Réservation réussie ! Quota utilisé : " . ($currentLoansCount + 1) . "/$limit"]);
});

Route::post('/book-issues/{id}/validate', function ($id) {
    $dueDate = now()->addDays(15)->format('Y-m-d');
    \Illuminate\Support\Facades\DB::table('book_issues')->where('id', $id)->update(['issue_status' => 'N', 'return_date' => $dueDate, 'updated_at' => now()]);
    return response()->json(['message' => 'Validé']);
});

Route::get('/all-issued-books', function () {
    return \Illuminate\Support\Facades\DB::table('book_issues')
        ->join('books', 'book_issues.book_id', '=', 'books.id')
        ->join('users', 'book_issues.student_id', '=', 'users.id')
        ->select('book_issues.*', 'books.name as book_name', 'users.name as student_name')
        ->orderBy('book_issues.created_at', 'desc')->get();
});

Route::post('/book-issues/{id}/return', function ($id) {
    \Illuminate\Support\Facades\DB::table('book_issues')->where('id', $id)->update(['issue_status' => 'Y', 'return_day' => now(), 'updated_at' => now()]);
    return response()->json(['message' => 'Rendu']);
});

Route::delete('/book-issues/{id}', function ($id) {
    \Illuminate\Support\Facades\DB::table('book_issues')->where('id', $id)->delete();
    return response()->json(['message' => 'Supprimé']);
});

Route::get('/my-loans/{id}', function ($id) {
    return \Illuminate\Support\Facades\DB::table('book_issues')
        ->join('books', 'book_issues.book_id', '=', 'books.id')
        ->select('book_issues.*', 'books.name as book_name', 'books.cover_image')
        ->where('book_issues.student_id', $id)
        ->get();
});

Route::get('/catalog-books', function () {
    $books = Book::with(['auther', 'category'])->get();
    $reserved = \Illuminate\Support\Facades\DB::table('book_issues')->whereIn('issue_status', ['N', 'R'])->pluck('book_id')->toArray();
    foreach ($books as $b) {
        $b->is_available = !in_array($b->id, $reserved);
    }
    return response()->json($books);
});

Route::post('/books/{id}/update-image', function (Illuminate\Http\Request $request, $id) {
    $request->validate([
        'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
    ]);

    $book = Book::find($id);
    if (!$book) {
        return response()->json(['message' => 'Livre introuvable'], 404);
    }

    if ($request->hasFile('image')) {
        $file = $request->file('image');
        $imageName = time() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('public/covers', $imageName);

        $book->update(['cover_image' => $imageName]);
    }

    return response()->json($book->load(['auther', 'category']));
});