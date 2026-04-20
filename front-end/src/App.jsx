import { useState } from 'react';
import './App.css';
import Header from './Header';
import Login  from './login';
import Footer from './Footer';
import Index from './index';
import Dashboard from './dashboard';

function App() {
  // 1. Lazy initialization: Check sessionStorage ONLY ONCE on initial load
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Determine initial view based on whether a user was found
  const [currentView, setCurrentView] = useState(() => {
    return user ? 'dashboard' : 'index';
  });

  return (
    <>
      <Header setCurrentView={setCurrentView} />
      
      {currentView === 'index' ? (
        <Index setCurrentView={setCurrentView} />
      ) : currentView === 'login' ? (
        <Login setCurrentView={setCurrentView} setUser={setUser} />
      ) : (
        <Dashboard 
           user={user} 
           setUser={setUser} 
           setCurrentView={setCurrentView} 
        />
      )}

      <Footer />
    </>
  )
}

export default App;