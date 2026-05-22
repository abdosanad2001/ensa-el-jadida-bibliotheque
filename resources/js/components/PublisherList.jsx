import React, { useState, useEffect } from 'react';

// 1. Ajout de showToast dans les props
const PublisherList = ({ showToast }) => {
    const [publishers, setPublishers] = useState([]);
    const [newPublisher, setNewPublisher] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('/api/publishers-list')
            .then(res => res.json())
            .then(data => setPublishers(data));
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();
        
        // 2. Vérification avec avertissement Toast
        if (!newPublisher.trim()) {
            showToast("Le nom de l'éditeur ne peut pas être vide.", "warning");
            return;
        }

        fetch('/api/publishers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newPublisher })
        })
        .then(res => {
            if (!res.ok) throw new Error("Erreur serveur");
            return res.json();
        })
        .then(data => {
            setPublishers([...publishers, data]);
            setNewPublisher('');
            // 3. Notification de succès
            showToast("Éditeur ajouté avec succès !", "success");
        })
        .catch(err => showToast("Erreur lors de l'ajout de l'éditeur.", "error"));
    };

    const handleDelete = (id) => {
        if (window.confirm("Supprimer cet éditeur ?")) {
            fetch(`/api/publishers/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        setPublishers(publishers.filter(p => p.id !== id));
                        // 4. Notification informative
                        showToast("Éditeur supprimé.", "info");
                    } else {
                        // 5. Cas d'erreur (ex: éditeur lié à des livres)
                        showToast("Impossible de supprimer cet éditeur.", "error");
                    }
                })
                .catch(err => showToast("Erreur de communication avec le serveur.", "error"));
        }
    };

    const filteredPublishers = publishers.filter(pub => 
        pub.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#a92219', margin: 0 }}>Gestion des Éditeurs</h2>
                <input 
                    type="text" 
                    placeholder="🔍 Chercher un éditeur..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', width: '250px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div>

            <form onSubmit={handleAdd} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Nom du nouvel éditeur..." 
                    value={newPublisher} 
                    onChange={(e) => setNewPublisher(e.target.value)}
                    style={{ padding: '10px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Ajouter
                </button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#a92219', color: 'white' }}>
                        <th style={{ padding: '12px' }}>ID</th>
                        <th style={{ padding: '12px' }}>Nom de l'éditeur</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPublishers.map((pub, index) => (
                        <tr key={pub.id} style={{ borderBottom: '1px solid #eee', background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                            <td style={{ padding: '12px' }}>{pub.id}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{pub.name}</td>
                            <td style={{ padding: '12px' }}>
                                <button onClick={() => handleDelete(pub.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                    {filteredPublishers.length === 0 && (
                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Aucun éditeur trouvé.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PublisherList;