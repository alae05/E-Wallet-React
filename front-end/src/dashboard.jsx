import { useState, useEffect } from 'react';
import { getbeneficiaries } from './Model/database.js';
import './App.css';

function Dashboard({ user, setUser, setCurrentView }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  const [tBeneficiary, setTBeneficiary] = useState('');
  const [tSourceCard, setTSourceCard] = useState('');
  const [tAmount, setTAmount] = useState('');

  const [rSourceCard, setRSourceCard] = useState('');
  const [rAmount, setRAmount] = useState('');
  
  const [beneficiaries, setBeneficiaries] = useState([]);

  const transactions = user?.wallet?.transactions || [];
  const cards = user?.wallet?.cards || [];
  
  const monthlyIncome = transactions
    .filter(t => t.type === "credit" || t.type === "recharge")
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === "debit")
    .reduce((total, t) => total + t.amount, 0);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("currentUser", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      const data = getbeneficiaries(user.id);
      setBeneficiaries(data);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && user.name) {
      const originalTitle = document.title;
      document.title = `Espace Client - ${user.name}`;
      return () => {
        document.title = originalTitle; 
      };
    }
  }, [user?.name]);

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    setUser(null);
    setCurrentView('index');
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const amount = Number(tAmount);
    const updatedUser = JSON.parse(JSON.stringify(user));
    const cardIndex = updatedUser.wallet.cards.findIndex(c => c.numcards === tSourceCard);

    if (cardIndex === -1) {
      alert("Veuillez sélectionner une carte.");
      return;
    }

    if (updatedUser.wallet.cards[cardIndex].balance < amount) {
      alert(`Transfert refusé : Solde de la carte insuffisant (${updatedUser.wallet.cards[cardIndex].balance} MAD).`);
      return;
    }

    const beneficiary = beneficiaries.find(b => b.id.toString() === tBeneficiary);
    if (!beneficiary) {
      alert("Erreur: Bénéficiaire introuvable.");
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      type: "debit",
      amount: amount,
      date: new Date().toLocaleString("fr-FR"),
      from: tSourceCard,
      to: beneficiary.name,
      statue: "success"
    };
    
    updatedUser.wallet.cards[cardIndex].balance = updatedUser.wallet.cards[cardIndex].balance - amount;
    updatedUser.wallet.balance = updatedUser.wallet.balance - amount;
    updatedUser.wallet.transactions.push(newTransaction);
    
    setUser(updatedUser);
    setIsTransferOpen(false);
    setTBeneficiary('');
    setTSourceCard('');
    setTAmount('');
    alert(`Transfert de ${amount} MAD réussi !`);
  };

  const handleRechargeSubmit = (e) => {
    e.preventDefault();
    const amount = Number(rAmount);
    const updatedUser = JSON.parse(JSON.stringify(user));
    const cardIndex = updatedUser.wallet.cards.findIndex(c => c.numcards === rSourceCard);

    if (cardIndex === -1) {
      alert("Veuillez sélectionner une carte.");
      return;
    }

    if (updatedUser.wallet.cards[cardIndex].balance < amount) {
      alert(`Recharge impossible : Votre carte n'a que ${updatedUser.wallet.cards[cardIndex].balance} MAD.`);
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      type: "recharge",
      amount: amount,
      date: new Date().toLocaleString("fr-FR"),
      from: rSourceCard,
      to: "Solde Principal",
      statue: "success"
    };

    updatedUser.wallet.cards[cardIndex].balance = updatedUser.wallet.cards[cardIndex].balance - amount;
    updatedUser.wallet.balance = updatedUser.wallet.balance + amount;
    updatedUser.wallet.transactions.push(newTransaction);
    
    setUser(updatedUser);
    setIsRechargeOpen(false);
    setRSourceCard('');
    setRAmount('');
    alert(`Recharge de ${amount} MAD effectuée avec succès !`);
  };

  if (!user) return null;

  return (
    <>
      <main className="dashboard-main">
        <div className="dashboard-container">
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

          <div className="dashboard-content">
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
                        <button className="card-action"><i className="fas fa-star"></i></button>
                        <button className="card-action"><i className="fas fa-snowflake"></i></button>
                        <button className="card-action"><i className="fas fa-trash"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

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
                    value={tBeneficiary}
                    onChange={(e) => setTBeneficiary(e.target.value)}
                  >
                    <option value="" disabled>Choisir un bénéficiaire</option>
                    {beneficiaries.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sourceCard"><i className="fas fa-credit-card"></i> Depuis ma carte</label>
                  <select 
                    id="sourceCard" 
                    required
                    value={tSourceCard}
                    onChange={(e) => setTSourceCard(e.target.value)}
                  >
                    <option value="" disabled>Sélectionner une carte</option>
                    {cards.map(card => (
                      <option key={card.numcards} value={card.numcards}>
                        {card.type.toUpperCase()} ****{card.numcards.slice(-4)} ({card.balance} MAD)
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
                      required
                      value={tAmount}
                      onChange={(e) => setTAmount(e.target.value)}
                    />
                    <span className="currency">MAD</span>
                  </div>
                </div>
                
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsTransferOpen(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">Transférer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                    value={rSourceCard}
                    onChange={(e) => setRSourceCard(e.target.value)}
                  >
                    <option value="" disabled>Sélectionner une carte</option>
                    {cards.map(card => (
                      <option key={card.numcards} value={card.numcards}>
                        {card.type.toUpperCase()} ****{card.numcards.slice(-4)} ({card.balance} MAD)
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
                      required
                      value={rAmount}
                      onChange={(e) => setRAmount(e.target.value)}
                    />
                    <span className="currency">MAD</span>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsRechargeOpen(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">Recharger</button>
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
