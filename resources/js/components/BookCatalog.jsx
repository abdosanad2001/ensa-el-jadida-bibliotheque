import React, { useState, useEffect } from 'react';

const BookCatalog = ({ currentUser, showToast }) => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const loadData = () => {
        fetch('/api/catalog-books').then(res => res.json()).then(data => setBooks(data));
        fetch('/api/categories-list').then(res => res.json()).then(data => setCategories(data));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleReserve = (bookId) => {
        if (window.confirm("Voulez-vous vraiment réserver ce livre ?")) {
            fetch('/api/reserve-book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: currentUser.id, book_id: bookId })
            })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) {
                    showToast(data.message, "error");
                } else {
                    showToast(data.message, "success");
                    loadData();
                }
            })
            .catch(err => showToast("Erreur de connexion au serveur", "error"));
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || String(book.category_id) === String(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>📚 Catalogue des Livres</h2>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Rechercher un titre..." 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px 15px', width: '250px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }}
                />

                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ padding: '10px 15px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="all">📁 Toutes les catégories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
                {filteredBooks.map(book => (
                    <div key={book.id} style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: `5px solid ${book.is_available ? '#28a745' : '#dc3545'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        
                        {/* --- NOUVELLE SECTION IMAGE --- */}
                        <div style={{ height: '250px', marginBottom: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #eee' }}>
                            {book.cover_image ? (
                                <img 
                                    src={`/storage/covers/${book.cover_image}`} 
                                    alt={book.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            ) : (
                                <div style={{ textAlign: 'center', color: '#adb5bd' }}>
                                    <span style={{ fontSize: '50px' }}>📘</span>
                                    <p style={{ fontSize: '12px', margin: '5px 0 0 0' }}>Sans image</p>
                                </div>
                            )}
                        </div>
                        {/* ------------------------------- */}

                        <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{book.name}</h4>
                            <p style={{ fontSize: '12px', color: '#a92219', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                                {book.category?.name || 'Général'}
                            </p>
                            <p style={{ fontSize: '13px', color: '#666' }}>Auteur: {book.auther?.name || 'Anonyme'}</p>
                        </div>
                        
                        <div style={{ marginTop: '15px' }}>
                            <button 
                                onClick={() => handleReserve(book.id)} 
                                disabled={!book.is_available}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    background: book.is_available ? '#2c3e50' : '#bdc3c7', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    cursor: book.is_available ? 'pointer' : 'not-allowed', 
                                    fontWeight: 'bold',
                                    transition: '0.2s'
                                }}>
                                {book.is_available ? 'Réserver' : 'Indisponible'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredBooks.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
                    <p style={{ fontSize: '20px' }}>Aucun livre ne correspond à votre recherche.</p>
                </div>
            )}
        </div>
    );
};

export default BookCatalog;