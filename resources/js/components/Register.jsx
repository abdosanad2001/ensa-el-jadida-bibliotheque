import React, { useState } from 'react';

// 1. On ajoute showToast dans les props
const Register = ({ onGoToLogin, showToast }) => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: '1' // 1 = Étudiant (par défaut)
    });
    
    // 2. On a supprimé l'état "message" car le Toast s'en occupe !

    const handleSubmit = (e) => {
        e.preventDefault();
        
        fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(async res => {
            const data = await res.json();
            if (res.ok) {
                // 3. Notification de succès
                showToast("Inscription réussie ! Redirection...", "success");
                setFormData({ name: '', username: '', password: '', role: '1' }); // On vide le formulaire
                
                // 4. Bonus UX : Redirection automatique après 1.5s
                setTimeout(() => {
                    onGoToLogin();
                }, 1500);
                
            } else {
                // Erreur (ex: username déjà pris)
                showToast("Erreur : Ce nom d'utilisateur est peut-être déjà pris.", "error");
            }
        })
        .catch(err => showToast("Erreur de connexion au serveur.", "error"));
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '400px' }}>
                <h2 style={{ textAlign: 'center', color: '#a92219', marginBottom: '20px' }}>Créer un compte</h2>
                
                {/* L'ancien bloc {message && ...} a été supprimé ici */}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Nom complet</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="Ex: Mohamed" />
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Nom d'utilisateur (Pseudo)</label>
                        <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="Ex: mohamed.etu" />
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Mot de passe</label>
                        <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="Minimum 6 caractères" />
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Je suis un...</label>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}>
                            <option value="1">Étudiant</option>
                            <option value="2">Enseignant</option>
                        </select>
                    </div>

                    <button type="submit" style={{ padding: '12px', background: '#a92219', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>
                        S'inscrire
                    </button>
                </form>

                {/* Lien pour retourner à la page de connexion */}
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                    Déjà un compte ? <span onClick={onGoToLogin} style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Se connecter</span>
                </div>
            </div>
        </div>
    );
};

export default Register;