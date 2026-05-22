import './bootstrap';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// Imports de tes composants
import Login from './components/Login';
import Register from './components/Register';
import StatCard from './components/StatCard';
import AuthorList from './components/AuthorList';
import CategoryList from './components/CategoryList';
import PublisherList from './components/PublisherList';
import BookList from './components/BookList';
import StudentList from './components/StudentList';
import IssueBook from './components/IssueBook';
import BookCatalog from './components/BookCatalog';
import MyLoans from './components/MyLoans'; 
import Profile from './components/Profile';
import Toast from './components/Toast'; // <--- 1. IMPORT DU NOUVEAU COMPOSANT

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [view, setView] = useState('dashboard');
    const [stats, setStats] = useState({ cards: [], recentActivity: [] });
    const [authView, setAuthView] = useState('login'); 
    
    // 2. ÉTAT POUR LA NOTIFICATION
    const [toast, setToast] = useState(null);

    // 3. FONCTION MAGIQUE POUR AFFICHER UN TOAST
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        if (isLoggedIn && Number(currentUser?.role) === 0) {
            fetch('/api/dashboard-stats')
                .then(res => res.json())
                .then(data => setStats(data));
        }
        
        if (isLoggedIn && Number(currentUser?.role) !== 0) {
            setView('catalog');
        }
    }, [isLoggedIn, currentUser]);

    const handleLogout = () => {
        if (window.confirm("Voulez-vous vraiment quitter la session ?")) {
            setIsLoggedIn(false);
            setCurrentUser(null);
            setView('dashboard');
            setAuthView('login');
            showToast("Déconnexion réussie", "info"); // Notification de déconnexion
        }
    };

    if (!isLoggedIn) {
        if (authView === 'login') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center', backgroundColor: '#f0f2f5' }}>
                    <Login onLoginSuccess={(user) => {
                        setIsLoggedIn(true);
                        setCurrentUser(user);
                        showToast(`Bienvenue, ${user.name} !`); // Notification de bienvenue
                    }} />
                    <div style={{ marginTop: '20px', fontSize: '15px' }}>
                        Pas encore de compte ?{' '}
                        <span onClick={() => setAuthView('register')} style={{ color: '#a92219', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                            Créer un compte Étudiant/Enseignant
                        </span>
                    </div>
                    {/* TOAST ACCESSIBLE MÊME ICI */}
                    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                </div>
            );
        } else {
            return <Register onGoToLogin={() => setAuthView('login')} showToast={showToast} />;
        }
    }

    const isAdmin = Number(currentUser?.role) === 0;
    const navBgColor = isAdmin ? '#a92219' : '#2c3e50';
    
    const navBtnStyle = { 
        marginRight: '10px', padding: '10px 15px', cursor: 'pointer', background: navBgColor, 
        color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', transition: '0.3s' 
    };

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#fdfdfd', minHeight: '100vh' }}>
            <nav style={{ background: navBgColor, padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', color: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                    {isAdmin ? (
                        <>
                            <button onClick={() => setView('dashboard')} style={navBtnStyle}>Dashboard</button>
                            <button onClick={() => setView('authors')} style={navBtnStyle}>Auteurs</button>
                            <button onClick={() => setView('categories')} style={navBtnStyle}>Catégories</button> 
                            <button onClick={() => setView('publishers')} style={navBtnStyle}>Éditeurs</button> 
                            <button onClick={() => setView('books')} style={navBtnStyle}>Livres</button>
                            <button onClick={() => setView('students')} style={navBtnStyle}>Étudiants</button>
                            <button onClick={() => setView('issue')} style={navBtnStyle}>Emprunter</button>
                            <button onClick={() => setView('profile')} style={navBtnStyle}>Mon Profil</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setView('catalog')} style={navBtnStyle}>Catalogue</button>
                            <button onClick={() => setView('my-loans')} style={navBtnStyle}>Mes Emprunts</button>
                            <button onClick={() => setView('profile')} style={navBtnStyle}>Mon Profil</button>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '14px' }}>
                        {isAdmin ? 'Admin' : (Number(currentUser?.role) === 1 ? 'Étudiant' : 'Enseignant')} : <strong>{currentUser?.name}</strong>
                    </span>
                    <button onClick={handleLogout} style={{ padding: '6px 12px', background: '#000', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        Déconnexion
                    </button>
                </div>
            </nav>

            <div style={{ padding: '0 30px' }}>
                
                {/* VUES ADMINISTRATEUR - On passe showToast en prop si besoin */}
                {isAdmin && (
                    <>
                        {view === 'dashboard' && (
                            <div>
                                <h1 style={{ borderBottom: '3px solid #a92219', display: 'inline-block', paddingBottom: '5px', marginBottom: '30px' }}>Tableau de Bord</h1>
                                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', marginBottom: '40px' }}>
                                    {stats.cards?.map((s, i) => (
                                        <StatCard key={i} title={s.title} count={s.count} color={s.color} />
                                    ))}
                                </div>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', maxWidth: '800px' }}>
                                    <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>⚡ Activité Récente</h3>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {stats.recentActivity?.map((act, i) => (
                                            <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f9f9f9', display: 'flex', justifyContent: 'space-between' }}>
                                                <span><strong>{act.user_name}</strong> a {act.issue_status === 'R' ? 'réservé' : 'emprunté'} <em style={{ color: '#a92219' }}>{act.book_name}</em></span>
                                                <span style={{ color: '#888', fontSize: '12px' }}>{new Date(act.created_at).toLocaleDateString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {view === 'authors' && <AuthorList showToast={showToast} />}
                        {view === 'categories' && <CategoryList showToast={showToast} />} 
                        {view === 'publishers' && <PublisherList showToast={showToast} />}
                        {view === 'books' && <BookList showToast={showToast} />}
                        {view === 'students' && <StudentList showToast={showToast} />}
                        {view === 'issue' && <IssueBook showToast={showToast} />}
                    </>
                )}

                {/* VUES ÉTUDIANT / ENSEIGNANT */}
                {!isAdmin && (
                    <>
                        {view === 'catalog' && <BookCatalog currentUser={currentUser} showToast={showToast} />}
                        {view === 'my-loans' && <MyLoans currentUser={currentUser} showToast={showToast} />}
                    </>
                )}

                {/* VUE PROFIL */}
                {view === 'profile' && <Profile currentUser={currentUser} showToast={showToast} />}
            </div>
            
            {/* 4. LE COMPOSANT TOAST TOUJOURS PRÊT EN BAS DU DOM */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <footer style={{ marginTop: '50px', textAlign: 'center', padding: '20px', color: '#888', fontSize: '12px' }}>
                © 2026 eLibrary Management System | Développé avec Laravel & React
            </footer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);