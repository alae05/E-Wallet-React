import './App.css'

function Header() {

  return (
    <>
        <nav className="navbar">
      <a href="index.html" class="logo">
        <img src="../src/assets/e-wallet-logo.avif" alt="Logo E-Wallet"/>
      </a>
      <ul className="nav-links">
        <li><a href="index.html">Accueil</a></li>
        <li><a href="#">À propos</a></li>
        <li><a href="#">Fonctionnalités</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
    </>
  )
}

export default Header;
