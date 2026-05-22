import React, { useState, useEffect } from 'react';

// 1. On n'oublie pas de récupérer showToast
const CategoryList = ({ showToast }) => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Charger les catégories au démarrage
    useEffect(() => {
        fetch('/api/categories-list')
            .then(res => res.json())
            .then(data => setCategories(data));
    }, []);

    // Ajouter une catégorie
    const handleAdd = (e) => {
        e.preventDefault();
        
        // 2. Avertissement si le champ est vide
        if (!newCategory.trim()) {
            showToast("Le nom de la catégorie ne peut pas être vide.", "warning");
            return;
        }

        fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newCategory })
        })
        .then(res => {
            if (!res.ok) throw new Error("Erreur serveur");
            return res.json();
        })
        .then(data => {
            setCategories([...categories, data]);
            setNewCategory(''); // Vider le champ
            // 3. Notification de succès
            showToast("Catégorie ajoutée avec succès !", "success");
        })
        .catch(err => showToast("Erreur lors de l'ajout de la catégorie.", "error"));
    };

    // Supprimer une catégorie
    const handleDelete = (id) => {
        if (window.confirm("Supprimer cette catégorie ?")) {
            fetch(`/api/categories/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        setCategories(categories.filter(c => c.id !== id));
                        // 4. Notification de suppression
                        showToast("Catégorie supprimée.", "info");
                    } else {
                        // 5. Erreur si la catégorie est encore utilisée par des livres
                        showToast("Impossible de supprimer cette catégorie (elle contient des livres).", "error");
                    }
                })
                .catch(err => showToast("Erreur de communication avec le serveur.", "error"));
        }
    };

    // Filtrer avec la recherche
    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#a92219', margin: 0 }}>Gestion des Catégories</h2>
                <input 
                    type="text" 
                    placeholder="🔍 Chercher une catégorie..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', width: '250px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div>

            {/* Formulaire d'ajout */}
            <form onSubmit={handleAdd} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Nouvelle catégorie..." 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ padding: '10px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Ajouter
                </button>
            </form>

            {/* Tableau */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#a92219', color: 'white' }}>
                        <th style={{ padding: '12px' }}>ID</th>
                        <th style={{ padding: '12px' }}>Nom de la catégorie</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCategories.map((cat, index) => (
                        <tr key={cat.id} style={{ borderBottom: '1px solid #eee', background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                            <td style={{ padding: '12px' }}>{cat.id}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{cat.name}</td>
                            <td style={{ padding: '12px' }}>
                                <button onClick={() => handleDelete(cat.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                    {filteredCategories.length === 0 && (
                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Aucune catégorie trouvée.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryList;