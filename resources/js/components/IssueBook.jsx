import React, { useState, useEffect } from 'react';

// 1. On récupère showToast des props
const IssueBook = ({ showToast }) => {
    const [issues, setIssues] = useState([]);
    const [students, setStudents] = useState([]);
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ student_id: '', book_id: '' });

    const loadIssues = () => {
        fetch('/api/all-issued-books').then(res => res.json()).then(data => setIssues(data));
    };

    useEffect(() => {
        loadIssues();
        fetch('/api/students-list').then(res => res.json()).then(data => setStudents(data));
        fetch('/api/books-list').then(res => res.json()).then(data => setBooks(data));
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();
        // 2. Remplacement de l'alerte par un toast d'erreur
        if (!formData.student_id || !formData.book_id) {
            return showToast("Veuillez sélectionner un étudiant et un livre.", "error");
        }

        fetch('/api/book-issues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) {
                // 3. Affiche l'erreur du serveur (Quota, Déjà réservé, etc.)
                showToast(data.message, "error");
            } else {
                loadIssues();
                setFormData({ student_id: '', book_id: '' });
                // 4. Succès de l'emprunt manuel
                showToast("Emprunt manuel enregistré avec succès !", "success");
            }
        })
        .catch(err => showToast("Erreur de communication avec le serveur", "error"));
    };

    const handleDelete = (id) => {
        if (window.confirm("Supprimer cet emprunt de l'historique ?")) {
            fetch(`/api/book-issues/${id}`, { method: 'DELETE' })
                .then(() => {
                    loadIssues();
                    showToast("Entrée supprimée", "info");
                });
        }
    };

    const handleReturn = (id) => {
        fetch(`/api/book-issues/${id}/return`, { method: 'POST' })
            .then(() => {
                loadIssues();
                showToast("Livre marqué comme rendu !", "success");
            });
    };

    const handleValidate = (id) => {
        fetch(`/api/book-issues/${id}/validate`, { method: 'POST' })
            .then(() => {
                loadIssues();
                showToast("Retrait validé ! Le chrono des 15 jours a démarré.", "success");
            });
    };

    const filteredIssues = issues.filter(issue => 
        (issue.student_name && issue.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (issue.book_name && issue.book_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#a92219' }}>Gestion des Emprunts</h2>

            <form onSubmit={handleAdd} style={{ marginBottom: '20px', display: 'flex', gap: '10px', background: '#f9f9f9', padding: '15px' }}>
                <select value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} style={{ padding: '10px', flex: 1 }} required>
                    <option value="">-- Étudiant/Enseignant --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={formData.book_id} onChange={e => setFormData({...formData, book_id: e.target.value})} style={{ padding: '10px', flex: 1 }} required>
                    <option value="">-- Livre --</option>
                    {books.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Valider l'Emprunt Manuel
                </button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#a92219', color: 'white' }}>
                        <th style={{ padding: '12px' }}>Étudiant</th>
                        <th style={{ padding: '12px' }}>Livre</th>
                        <th style={{ padding: '12px' }}>Date Limite</th>
                        <th style={{ padding: '12px' }}>Statut</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredIssues.map((issue) => {
                        const isOverdue = issue.issue_status === 'N' && issue.return_date && new Date(issue.return_date) < new Date();
                        return (
                            <tr key={issue.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{issue.student_name}</td>
                                <td style={{ padding: '12px' }}>{issue.book_name}</td>
                                <td style={{ padding: '12px', color: isOverdue ? 'red' : 'inherit', fontWeight: isOverdue ? 'bold' : 'normal' }}>
                                    {issue.return_date ? new Date(issue.return_date).toLocaleDateString() : '-'}
                                    {isOverdue && " ⚠️ RETARD"}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {issue.issue_status === 'R' && <span style={{ background: '#ffc107', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Réservé</span>}
                                    {issue.issue_status === 'N' && <span style={{ background: '#17a2b8', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Emprunté</span>}
                                    {issue.issue_status === 'Y' && <span style={{ background: '#28a745', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Retourné</span>}
                                </td>
                                <td style={{ padding: '12px', display: 'flex', gap: '5px' }}>
                                    {issue.issue_status === 'R' && <button onClick={() => handleValidate(issue.id)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>✓ Valider</button>}
                                    {issue.issue_status === 'N' && <button onClick={() => handleReturn(issue.id)} style={{ background: '#17a2b8', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>✓ Rendu</button>}
                                    <button onClick={() => handleDelete(issue.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Suppr.</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default IssueBook;