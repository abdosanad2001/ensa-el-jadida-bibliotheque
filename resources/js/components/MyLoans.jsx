import React, { useState, useEffect } from 'react';

const MyLoans = ({ currentUser, showToast }) => {
    const [myBooks, setMyBooks] = useState([]);

    useEffect(() => {
        fetch(`/api/my-loans/${currentUser.id}`)
            .then(res => res.json())
            .then(data => setMyBooks(data));
    }, [currentUser.id]);

    const handleCancel = (id) => {
        if (window.confirm("Voulez-vous vraiment annuler cette réservation ?")) {
            fetch(`/api/book-issues/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        setMyBooks(myBooks.filter(book => book.id !== id));
                        showToast("Réservation annulée avec succès !", "success");
                    } else {
                        showToast("Erreur lors de l'annulation.", "error");
                    }
                })
                .catch(err => showToast("Problème de connexion au serveur.", "error"));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #2c3e50', paddingBottom: '10px' }}>
                📋 Mon Historique d'Emprunts
            </h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <thead>
                    <tr style={{ background: '#2c3e50', color: 'white' }}>
                        <th style={{ padding: '12px', textAlign: 'center', width: '60px' }}>Image</th> {/* NOUVELLE COLONNE */}
                        <th style={{ padding: '12px', textAlign: 'left' }}>Livre</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>À rendre avant le</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Statut</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {myBooks.map(loan => (
                        <tr key={loan.id} style={{ borderBottom: '1px solid #eee' }}>
                            {/* AFFICHAGE DE LA COUVERTURE */}
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                {loan.cover_image ? (
                                    <img 
                                        src={`/storage/covers/${loan.cover_image}`} 
                                        alt="Couverture" 
                                        style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} 
                                    />
                                ) : (
                                    <div style={{ width: '40px', height: '60px', background: '#e9ecef', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                        <span style={{ fontSize: '10px', color: '#adb5bd' }}>Aucune</span>
                                    </div>
                                )}
                            </td>

                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{loan.book_name}</td>
                            <td style={{ padding: '12px' }}>{new Date(loan.created_at).toLocaleDateString()}</td>
                            
                            <td style={{ padding: '12px' }}>
                                {loan.return_date ? new Date(loan.return_date).toLocaleDateString() : '-'}
                            </td>

                            <td style={{ padding: '12px' }}>
                                {loan.issue_status === 'R' && <span style={{ color: '#ffc107', fontWeight: 'bold' }}>● Réservé</span>}
                                {loan.issue_status === 'N' && <span style={{ color: '#17a2b8', fontWeight: 'bold' }}>● Emprunté</span>}
                                {loan.issue_status === 'Y' && <span style={{ color: '#27ae60', fontWeight: 'bold' }}>✓ Retourné</span>}
                            </td>
                            
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                {loan.issue_status === 'R' && (
                                    <button 
                                        onClick={() => handleCancel(loan.id)} 
                                        style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Annuler
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {myBooks.length === 0 && (
                        /* Le colSpan passe à 6 pour couvrir la nouvelle colonne Image */
                        <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Aucun emprunt trouvé.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MyLoans;