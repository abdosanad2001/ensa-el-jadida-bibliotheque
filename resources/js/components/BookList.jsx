import React, { useState, useEffect } from 'react';

const BookList = ({ showToast }) => {
    const [books, setBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    
    const [formData, setFormData] = useState({ name: '', auther_id: '', category_id: '' });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetch('/api/books-list').then(res => res.json()).then(data => setBooks(data));
        fetch('/api/authors-list').then(res => res.json()).then(data => setAuthors(data));
        fetch('/api/categories-list').then(res => res.json()).then(data => setCategories(data));
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!formData.auther_id || !formData.category_id) {
            return showToast("Veuillez choisir un auteur et une catégorie.", "warning");
        }

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('auther_id', formData.auther_id);
        submitData.append('category_id', formData.category_id);
        
        if (imageFile) {
            submitData.append('image', imageFile);
        }

        fetch('/api/books', {
            method: 'POST',
            body: submitData
        })
        .then(res => {
            if (!res.ok) throw new Error("Erreur serveur");
            return res.json();
        })
        .then(data => {
            setBooks([...books, data]);
            
            setFormData({ name: '', auther_id: '', category_id: '' }); 
            setImageFile(null);
            document.getElementById('cover-upload').value = ''; 
            
            showToast("Livre ajouté au stock avec succès !", "success");
        })
        .catch(err => showToast("Erreur lors de l'ajout du livre.", "error"));
    };

    const handleDelete = (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce livre du catalogue ?")) {
            fetch(`/api/books/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        setBooks(books.filter(b => b.id !== id));
                        showToast("Livre supprimé du stock.", "info");
                    } else {
                        showToast("Impossible de supprimer ce livre (il est peut-être emprunté).", "error");
                    }
                })
                .catch(err => showToast("Erreur lors de la suppression.", "error"));
        }
    };

    // --- NOUVELLE FONCTION : MISE À JOUR DE L'IMAGE ---
    const handleUpdateImage = (id, file) => {
        if (!file) return;

        const submitData = new FormData();
        submitData.append('image', file);

        fetch(`/api/books/${id}/update-image`, {
            method: 'POST',
            body: submitData
        })
        .then(res => {
            if (!res.ok) throw new Error("Erreur lors de l'upload");
            return res.json();
        })
        .then(updatedBook => {
            // Met à jour le livre spécifique dans la liste locale
            setBooks(books.map(b => b.id === id ? updatedBook : b));
            showToast("Image mise à jour avec succès !", "success");
        })
        .catch(err => showToast("Erreur lors de la mise à jour de l'image.", "error"));
    };

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#a92219', marginBottom: '20px' }}>Gestion du Stock de Livres</h2>

            <form onSubmit={handleAdd} style={{ marginBottom: '30px', display: 'flex', gap: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '4px', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    placeholder="Titre du livre" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    style={{ padding: '10px', flex: 2, minWidth: '200px', border: '1px solid #ccc', borderRadius: '4px' }} 
                    required 
                />

                <select 
                    value={formData.auther_id} 
                    onChange={e => setFormData({...formData, auther_id: e.target.value})} 
                    style={{ padding: '10px', flex: 1, minWidth: '150px', border: '1px solid #ccc', borderRadius: '4px' }} 
                    required
                >
                    <option value="">-- Auteur --</option>
                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>

                <select 
                    value={formData.category_id} 
                    onChange={e => setFormData({...formData, category_id: e.target.value})} 
                    style={{ padding: '10px', flex: 1, minWidth: '150px', border: '1px solid #ccc', borderRadius: '4px' }} 
                    required
                >
                    <option value="">-- Catégorie --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <input 
                    id="cover-upload"
                    type="file" 
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files[0])}
                    style={{ padding: '10px', flex: 1, minWidth: '200px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }} 
                />

                <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Ajouter au stock
                </button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#a92219', color: 'white' }}>
                        <th style={{ padding: '12px', textAlign: 'center', width: '60px' }}>Image</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Titre</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Auteur</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Catégorie</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map(book => (
                        <tr key={book.id} style={{ borderBottom: '1px solid #eee' }}>
                            {/* --- COLONNE IMAGE MISE À JOUR --- */}
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                {book.cover_image ? (
                                    <img 
                                        src={`/storage/covers/${book.cover_image}`} 
                                        alt="Couverture" 
                                        style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} 
                                    />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                        <label style={{ 
                                            fontSize: '11px', 
                                            background: '#f1f3f5', 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            cursor: 'pointer',
                                            color: '#495057',
                                            border: '1px solid #ced4da',
                                            fontWeight: 'bold',
                                            transition: '0.2s'
                                        }}>
                                            + Image
                                            <input 
                                                type="file" 
                                                hidden 
                                                accept="image/*"
                                                onChange={(e) => handleUpdateImage(book.id, e.target.files[0])} 
                                            />
                                        </label>
                                    </div>
                                )}
                            </td>
                            {/* --------------------------------- */}

                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{book.name}</td>
                            <td style={{ padding: '12px' }}>{book.auther?.name || 'Inconnu'}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{ background: '#e9ecef', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                    {book.category?.name || 'Général'}
                                </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button onClick={() => handleDelete(book.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BookList;