import { useState } from 'react';
import { getbeneficiaries, findbeneficiarieByid } from './Model/database.js';
import './App.css';

function Dashboard({ user, setUser, setCurrentView }) {
  // --- UI State ---
  const [activeSection, setActiveSection] = useState('overview');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  // --- Form State ---
  const [transferData, setTransferData] = useState({ beneficiary: '', sourceCard: '', amount: '' });
  const [rechargeData, setRechargeData] = useState({ sourceCard: '', amount: '' });

  // --- Derived Data (calculated safely on every render) ---
  const transactions = user?.wallet?.transactions || [];
  const cards = user?.wallet?.cards || [];
  
  const monthlyIncome = transactions
    .filter(t => t.type === "credit" || t.type === "recharge")
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === "debit")
    .reduce((total, t) => total + t.amount, 0);

  // --- Handlers ---
  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    setUser(null);
    setCurrentView('index');
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const amount = Number(transferData.amount);

    if (user.wallet.balance < amount) {
      alert("Erreur: Solde insuffisant.");
      return;
    }

    const beneficiary = findbeneficiarieByid(user.id, transferData.beneficiary);
    if (!beneficiary) {
      alert("Erreur: Bénéficiaire introuvable.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type: "debit",
      amount: amount,
      date: new Date().toLocaleString("fr-FR"),
      to: beneficiary.name,
      statue: "success"
    };

    // Deep copy state update
    const updatedUser = { 
      ...user,
      wallet: {
        ...user.wallet,
        balance: user.wallet.balance - amount,
        transactions: [...transactions, newTransaction]
      }
    };
    
    setUser(updatedUser);
    sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
    
    setIsTransferOpen(false);
    setTransferData({ beneficiary: '', sourceCard: '', amount: '' });
    alert(`Transfert de ${amount} MAD vers ${beneficiary.name} réussi !`);
  };

  const handleRechargeSubmit = (e) => {
    e.preventDefault();
    const amount = Number(rechargeData.amount);

    if (amount < 10 || amount > 5000) {
      alert("Le montant doit être compris entre 10 et 5000 MAD.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type: "recharge",
      amount: amount,
      date: new Date().toLocaleString("fr-FR"),
      to: user.name,
      statue: "success"
    };

    // Deep copy state update
    const updatedUser = { 
      ...user,
      wallet: {
        ...user.wallet,
        balance: user.wallet.balance + amount,
        transactions: [...transactions, newTransaction]
      }
    };
    
    setUser(updatedUser);
    sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
    
    setIsRechargeOpen(false);
    setRechargeData({ sourceCard: '', amount: '' });
    alert(`Recharge de ${amount} MAD réussie !`);
  };

  // Guard clause: Ensure user exists before rendering to prevent crashes
  if (!user) return null;

  return (
    <>
      <main className="dashboard-main">
        <div className="dashboard-container">
          
          {/* --- SIDEBAR --- */}
          <aside className="dashboard-sidebar">
            <nav className="sidebar-nav">
              <ul>
                <li className={activeSection === 'overview' ? 'active' : ''}>
                  <a href="#overview" onClick={(e) => { e.preventDefault(); setActiveSection('overview'); }}>
                    <i className="fas fa-home"></i>
                    <span>Vue d'ensemble</span>
                  </a>
                </li>
                <li className={activeSection === 'cards' ? 'active' : ''}>
                  <a href="#cards" onClick={(e) => { e.preventDefault(); setActiveSection('cards'); }}>
                    <i className="fas fa-credit-card"></i>
                    <span>Mes cartes</span>
                  </a>
                </li>
                <li className="separator"></li>
                <li>
                  <a href="#logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Déconnexion</span>
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <div className="dashboard-content">
            
            {/* OVERVIEW SECTION */}
            {activeSection === 'overview' && (
              <section id="overview" className="dashboard-section active">
                <div className="section-header">
                  <h2>Bonjour, <span>{user.name}</span> !</h2>
                  <p className="date-display">{new Date().toLocaleDateString("fr-FR")}</p>
                </div>

                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="card-icon blue"><i className="fas fa-wallet"></i></div>
                    <div className="card-details">
                      <span className="card-label">Solde disponible</span>
                      <span className="card-value">{user.wallet.balance.toFixed(2)} {user.wallet.currency}</span>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon green"><i className="fas fa-arrow-up"></i></div>
                    <div className="card-details">
                      <span className="card-label">Revenus</span>
                      <span className="card-value">{monthlyIncome.toFixed(2)} MAD</span>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon red"><i className="fas fa-arrow-down"></i></div>
                    <div className="card-details">
                      <span className="card-label">Dépenses</span>
                      <span className="card-value">{monthlyExpenses.toFixed(2)} MAD</span>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon purple"><i className="fas fa-credit-card"></i></div>
                    <div className="card-details">
                      <span className="card-label">Cartes actives</span>
                      <span className="card-value">{cards.length}</span>
                    </div>
                  </div>
                </div>

                <div className="quick-actions">
                  <h3>Actions rapides</h3>
                  <div className="action-buttons">
                    <button className="action-btn" onClick={() => setIsTransferOpen(true)}>
                      <i className="fas fa-paper-plane"></i>
                      <span>Transférer</span>
                    </button>
                    <button className="action-btn" onClick={() => setIsRechargeOpen(true)}>
                      <i className="fas fa-plus-circle"></i>
                      <span>Recharger</span>
                    </button>
                    <button className="action-btn">
                      <i className="fas fa-hand-holding-usd"></i>
                      <span>Demander</span>
                    </button>
                  </div>
                </div>
                
                <div className="recent-transactions">
                  <div className="section-header">
                    <h3>Transactions récentes</h3>
                  </div>
                  <div className="transactions-list">
                    {/* Reverse the array to show newest first */}
                    {transactions.slice().reverse().map((t, index) => (
                      <div key={t.id || index} className="transaction-item">
                        <div className="transaction-details">
                          <span className="transaction-name">
                            {t.type === 'debit' ? `Transfert à ${t.to}` : (t.type === 'recharge' ? 'Recharge' : `Reçu de ${t.from || 'Inconnu'}`)}
                          </span>
                          <span className="transaction-date">{t.date}</span>
                        </div>
                        <div className={`transaction-amount ${t.type === 'debit' ? 'debit' : 'credit'}`}>
                          {t.type === 'debit' ? '-' : '+'}{t.amount} MAD
                        </div>
                        <div style={{ color: t.statue === 'success' ? '#2e7d32' : '#c62828', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {t.statue}
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && <p style={{ color: '#666' }}>Aucune transaction récente.</p>}
                  </div>
                </div>
              </section>
            )}

            {/* CARDS SECTION */}
            {activeSection === 'cards' && (
              <section id="cards" className="dashboard-section active">
                <div className="section-header">
                  <h2>Mes cartes</h2>
                  <button className="btn btn-secondary" type="button">
                    <i className="fas fa-plus"></i> Ajouter une carte
                  </button>
                </div>
                
                <div className="cards-grid">
                  {cards.map((card, index) => (
                    <div key={index} className="card-item">
                      <div className={`card-preview ${card.type ? card.type.toLowerCase() : 'visa'}`}>
                        <div className="card-chip"></div>
                        <div className="card-number">**** **** **** {card.numcards.slice(-4)}</div>
                        <div className="card-holder">{user.name}</div>
                        <div className="card-expiry">{card.expiry || '12/28'}</div>
                        <div className="card-type">{card.type}</div>
                      </div>
                      <div className="card-actions">
                        <button className="card-action" title="Définir par défaut"><i className="fas fa-star"></i></button>
                        <button className="card-action" title="Geler la carte"><i className="fas fa-snowflake"></i></button>
                        <button className="card-action" title="Supprimer"><i className="fas fa-trash"></i></button>
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && <p style={{ color: '#666' }}>Aucune carte disponible.</p>}
                </div>
              </section>
            )}

          </div>
        </div>
      </main>

      {/* --- POPUPS --- */}

      {/* Transfer Popup */}
      {isTransferOpen && (
        <div className="popup-overlay active">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Effectuer un transfert</h2>
              <button className="btn-close" onClick={() => setIsTransferOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="popup-body">
              <form className="transfer-form" onSubmit={handleTransferSubmit}>
                <div className="form-group">
                  <label htmlFor="beneficiary"><i className="fas fa-user"></i> Bénéficiaire</label>
                  <select 
                    id="beneficiary" 
                    required 
                    value={transferData.beneficiary}
                    onChange={(e) => setTransferData({...transferData, beneficiary: e.target.value})}
                  >
                    <option value="" disabled>Choisir un bénéficiaire</option>
                    {getbeneficiaries(user.id).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sourceCard"><i className="fas fa-credit-card"></i> Depuis ma carte</label>
                  <select 
                    id="sourceCard" 
                    required
                    value={transferData.sourceCard}
                    onChange={(e) => setTransferData({...transferData, sourceCard: e.target.value})}
                  >
                    <option value="" disabled>Sélectionner une carte</option>
                    {cards.map(card => (
                      <option key={card.numcards} value={card.numcards}>
                        {card.type} ****{card.numcards.slice(-4)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="amount">Montant</label>
                  <div className="amount-input">
                    <input 
                      type="number" 
                      id="amount" 
                      min="1" 
                      step="0.01" 
                      placeholder="0.00" 
                      required
                      value={transferData.amount}
                      onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                    />
                    <span className="currency">MAD</span>
                  </div>
                </div>
                
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsTransferOpen(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary"><i className="fas fa-paper-plane"></i> Transférer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Popup */}
      {isRechargeOpen && (
        <div className="popup-overlay active">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Effectuer une recharge</h2>
              <button className="btn-close" onClick={() => setIsRechargeOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="popup-body">
              <form className="transfer-form" onSubmit={handleRechargeSubmit}>
                <div className="form-group">
                  <label htmlFor="sourceCard2"><i className="fas fa-credit-card"></i> Mes cartes</label>
                  <select 
                    id="sourceCard2" 
                    required
                    value={rechargeData.sourceCard}
                    onChange={(e) => setRechargeData({...rechargeData, sourceCard: e.target.value})}
                  >
                    <option value="" disabled>Sélectionner une carte</option>
                    {cards.map(card => (
                      <option key={card.numcards} value={card.numcards}>
                        {card.type} ****{card.numcards.slice(-4)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="amount2">Montant</label>
                  <div className="amount-input">
                    <input 
                      type="number" 
                      id="amount2" 
                      min="10" 
                      step="0.01" 
                      placeholder="0.00" 
                      required
                      value={rechargeData.amount}
                      onChange={(e) => setRechargeData({...rechargeData, amount: e.target.value})}
                    />
                    <span className="currency">MAD</span>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsRechargeOpen(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary"><i className="fas fa-plus-circle"></i> Recharger</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;