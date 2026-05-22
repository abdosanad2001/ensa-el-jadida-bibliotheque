import React, { useState, useEffect } from 'react';

// 1. On récupère showToast depuis les props
const AuthorList = ({ showToast }) => {
    const [authors, setAuthors] = useState([]);
    const [newAuthor, setNewAuthor] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Charger les auteurs au démarrage
    useEffect(() => {
        fetch('/api/authors-list')
            .then(res => res.json())
            .then(data => setAuthors(data));
    }, []);

    // Ajouter un nouvel auteur
    const handleAdd = (e) => {
        e.preventDefault();
        
        // 2. Avertissement si le champ est vide
        if (!newAuthor.trim()) {
            showToast("Le nom de l'auteur ne peut pas être vide.", "warning");
            return;
        }

        fetch('/api/authors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newAuthor })
        })
        .then(res => {
            if (!res.ok) throw new Error("Erreur serveur");
            return res.json();
        })
        .then(data => {
            setAuthors([...authors, data]);
            setNewAuthor(''); 
            // 3. Notification de succès
            showToast("Auteur ajouté avec succès !", "success");
        })
        .catch(err => showToast("Erreur lors de l'ajout de l'auteur.", "error"));
    };

    // Supprimer un auteur
    const handleDelete = (id) => {
        if (window.confirm("Supprimer cet auteur ?")) {
            fetch(`/api/authors/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        setAuthors(authors.filter(a => a.id !== id));
                        // 4. Notification de suppression
                        showToast("Auteur supprimé.", "info");
                    } else {
                        // 5. Erreur si l'auteur est lié à un livre existant
                        showToast("Impossible de supprimer cet auteur (il possède des livres dans le catalogue).", "error");
                    }
                })
                .catch(err => showToast("Erreur de communication avec le serveur.", "error"));
        }
    };

    // Filtrer les auteurs avec la barre de recherche
    const filteredAuthors = authors.filter(author => 
        author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#a92219', margin: 0 }}>Gestion des Auteurs</h2>
                <input 
                    type="text" 
                    placeholder="🔍 Chercher un auteur..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', width: '250px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div>

            {/* Formulaire d'ajout */}
            <form onSubmit={handleAdd} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Nom du nouvel auteur..." 
                    value={newAuthor} 
                    onChange={(e) => setNewAuthor(e.target.value)}
                    style={{ padding: '10px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Ajouter
                </button>
            </form>

            {/* Tableau design eLibrary */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#a92219', color: 'white' }}>
                        <th style={{ padding: '12px' }}>ID</th>
                        <th style={{ padding: '12px' }}>Nom de l'auteur</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAuthors.map((author, index) => (
                        <tr key={author.id} style={{ borderBottom: '1px solid #eee', background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                            <td style={{ padding: '12px' }}>{author.id}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{author.name}</td>
                            <td style={{ padding: '12px' }}>
                                <button onClick={() => handleDelete(author.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                    {filteredAuthors.length === 0 && (
                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Aucun auteur trouvé.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AuthorList;