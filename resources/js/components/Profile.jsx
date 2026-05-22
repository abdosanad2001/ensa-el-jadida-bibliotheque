import React, { useState } from 'react';

// 1. On récupère showToast dans les props
const Profile = ({ currentUser, showToast }) => {
    const [newPassword, setNewPassword] = useState('');
    
    // On a supprimé l'état "message" car le Toast va s'en charger !

    const handleChangePassword = (e) => {
        e.preventDefault();
        fetch('/api/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                new_password: newPassword
            })
        })
        .then(async res => {
            const data = await res.json();
            if (res.ok) {
                // 2. Notification de succès
                showToast(data.message, "success");
                setNewPassword('');
            } else {
                // Notification si le mot de passe est trop court par exemple
                showToast(data.message || "Erreur de validation.", "error");
            }
        })
        .catch(err => {
            // 3. Notification d'erreur serveur
            showToast("Erreur lors du changement de mot de passe.", "error");
        });
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                👤 Mon Profil Personnel
            </h2>

            <div style={{ marginBottom: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <p><strong>Nom complet :</strong> {currentUser.name}</p>
                <p><strong>Nom d'utilisateur :</strong> {currentUser.username}</p>
                <p><strong>Statut :</strong> {Number(currentUser.role) === 2 ? 'Enseignant' : 'Étudiant'}</p>
            </div>

            <h3 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '15px' }}>🔒 Sécurité du compte</h3>
            
            <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>Nouveau mot de passe :</label>
                    <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 caractères"
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' }}
                        required 
                    />
                </div>
                
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Mettre à jour mon mot de passe
                </button>
            </form>
            
            {/* 4. Le bloc statique {message} a été supprimé pour laisser place au Toast */}
        </div>
    );
};

export default Profile;