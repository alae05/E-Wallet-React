import { useState } from 'react';
import { finduserbymail } from './Model/database.js'; // Vérifie bien ce chemin selon ton dossier
import './App.css';

// 1. IMPORTATION DE L'IMAGE POUR VITE
// Assure-toi que le chemin relatif vers le dossier assets est correct par rapport à Login.jsx
import loginIllustration from './assets/e-Wallet6.gif'; 

function Login({ setCurrentView, setUser }) {
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const loggedInUser = finduserbymail(mail, password);
    
    if (loggedInUser) {
      sessionStorage.setItem("currentUser", JSON.stringify(loggedInUser));
      setUser(loggedInUser); 
      setCurrentView('dashboard'); 
    } else {
      setError("Identifiants incorrects.");
    }
  };

  return (
    <main>
      <section className="hero">
        
        {/* Partie Gauche : Le Formulaire */}
        <div className="hero-content">
          <h1>Connexion</h1>
          <p>Accédez à votre E-Wallet en toute sécurité et gérez vos transactions en toute confiance.</p>
          
          {error && <p style={{ color: '#c62828', fontWeight: 'bold', marginBottom: '15px' }}>{error}</p>}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input 
                type="email" 
                placeholder="Adresse e-mail" 
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input 
                type="password" 
                placeholder="Mot de passe" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="toggle-password">👁</span>
            </div>
            
            <button type="submit" className="btn btn-primary">Se connecter</button>
          </form>
          <p style={{marginTop: '15px', fontSize: '0.9rem'}}>
            Vous n'avez pas encore de compte ?
            <a href="#" style={{color:'#3b66f6', fontWeight:'600', marginLeft: '5px'}}>S'inscrire</a>
          </p>
        </div>

        {/* Partie Droite : L'Image (Remise en place !) */}
        <div className="hero-image">
          {/* 2. UTILISATION DE LA VARIABLE IMPORTÉE */}
          <img src={loginIllustration} alt="Illustration de connexion" />
        </div>

      </section>
    </main>
  );
}

export default Login;