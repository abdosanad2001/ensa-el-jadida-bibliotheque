import React from 'react';

// Ce morceau ne s'occupe QUE de dessiner un carré
const StatCard = ({ title, count, color }) => {
    return (
        <div style={{ 
            background: color, 
            color: 'white', 
            padding: '20px', 
            borderRadius: '5px', 
            minWidth: '150px',
            textAlign: 'center'
        }}>
            <h2>{count}</h2>
            <p>{title}</p>
        </div>
    );
};

// On "exporte" pour que les autres fichiers puissent l'utiliser
export default StatCard;