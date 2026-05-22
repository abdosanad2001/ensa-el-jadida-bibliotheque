import React, { useState, useEffect } from 'react';

const StudentList = ({ showToast }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '', username: '', role: '1' });

    useEffect(() => {
        fetch('/api/students-list').then(res => res.json()).then(data => setStudents(data));
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.username.trim()) {
            return showToast("Veuillez remplir le nom complet et le pseudo.", "warning");
        }

        const token = localStorage.getItem('auth_token');

        fetch('/api/students', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(formData)
        })
        .then(async res => {
            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                console.error("Détails de l'erreur Laravel :", errorData);
                const errorMessage = errorData?.message || "Une erreur serveur s'est produite.";
                showToast(`Erreur : ${errorMessage}`, "error");
                throw new Error(errorMessage);
            }
            return res.json();
        })
        .then(data => {
            setStudents([...students, data]);
            setFormData({ name: '', username: '', role: '1' }); 
            showToast("Compte créé ! Mot de passe par défaut : 123456", "success");
        })
        .catch(err => console.log(err)); 
    };

    const handleDelete = (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce compte ?")) {
            
            const token = localStorage.getItem('auth_token');

            fetch(`/api/students/${id}`, { 
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => {
                if(res.ok) {
                    setStudents(students.filter(s => s.id !== id));
                    showToast("Compte utilisateur supprimé.", "info");
                } else {
                    showToast("Impossible de supprimer (Erreur de permission ou emprunt en cours).", "error");
                }
            })
            .catch(err => showToast("Erreur de communication avec le serveur.", "error"));
        }
    };

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (student.username && student.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#a92219', margin: 0 }}>Gestion des Utilisateurs</h2>
                <input 
                    type="text" 
                    placeholder="🔍 Chercher un nom ou pseudo..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', width: '250px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div>

            <form onSubmit={handleAdd} style={{ marginBottom: '20px', display: 'flex', gap: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
                <input type="text" placeholder="Nom complet" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '10px', flex: 2, border: '1px solid #ccc', borderRadius: '4px' }} required />
                
                <input type="text" placeholder="Pseudo de connexion" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ padding: '10px', flex: 2, border: '1px solid #ccc', borderRadius: '4px' }} required />
                
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ padding: '10px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }}>
                    {/* 👇 C'est ici que j'ai retiré le mot Admin 👇 */}
                    <option value="1">Étudiant</option>
                    <option value="2">Enseignant</option>
                </select>

                <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Créer un compte
                </button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#a92219', color: 'white' }}>
                        <th style={{ padding: '12px' }}>ID</th>
                        <th style={{ padding: '12px' }}>Nom complet</th>
                        <th style={{ padding: '12px' }}>Pseudo de connexion</th>
                        <th style={{ padding: '12px' }}>Statut</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.map((student, index) => (
                        <tr key={student.id} style={{ borderBottom: '1px solid #eee', background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                            <td style={{ padding: '12px' }}>{student.id}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{student.name}</td>
                            <td style={{ padding: '12px', color: '#0056b3' }}>{student.username}</td>
                            
                            <td style={{ padding: '12px' }}>
                                {Number(student.role) === 1 ? (
                                    <span style={{ background: '#e2e3e5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Étudiant</span>
                                ) : (
                                    <span style={{ background: '#d1ecf1', color: '#0c5460', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Enseignant</span>
                                )}
                            </td>
                            
                            <td style={{ padding: '12px' }}>
                                <button onClick={() => handleDelete(student.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Aucun utilisateur trouvé.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default StudentList;