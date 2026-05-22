import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        
        fetch('/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json' // On force Laravel à répondre en JSON
            },
            body: JSON.stringify({ username, password })
        })
        .then(res => {
            if (!res.ok) throw new Error("Nom d'utilisateur ou mot de passe incorrect");
            return res.json();
        })
        .then(data => {
            // NOUVEAU : On stocke le jeton de sécurité dans le navigateur
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
            }
            
            // Si c'est bon, on débloque le site !
            onLoginSuccess(data.user);
        })
        .catch(err => setError(err.message));
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f4', fontFamily: 'sans-serif' }}>
            
            {/* Le logo façon eLibrary */}
            <h1 style={{ color: '#a92219', fontSize: '3rem', marginBottom: '20px' }}>
                <span style={{ fontStyle: 'italic' }}>e</span>Library
            </h1>

            <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '350px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Connexion Admin</h2>
                
                {error && <div style={{ color: 'white', background: '#d9534f', padding: '10px', marginBottom: '15px', borderRadius: '4px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Username (Email)" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <input 
                        type="password" 
                        placeholder="Mot de passe" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <button type="submit" style={{ padding: '12px', background: '#a92219', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;