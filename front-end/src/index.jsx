import './App.css';

function Index({ setCurrentView }) {
  return (
    <section className="hero">
      <div className="hero-content" id="main">
        <h1>E-Wallet</h1>
        <p>Gérez vos finances facilement et en toute sécurité. Simplifiez vos paiements et transactions grâce à notre solution moderne.</p>
        <div className="buttons">
          {/* Instant transition to the login view */}
          <button 
            className="btn btn-primary" 
            onClick={() => setCurrentView('login')}
          >
            Login
          </button>
          <button className="btn btn-secondary">Sign in</button>
        </div>
      </div>
      <div className="hero-image">
        <img src="../src/assets/e-Wallet6.gif" alt="E-Wallet Illustration"/>
      </div>
    </section>
  );
}

export default Index;