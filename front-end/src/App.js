import './App.css';

function App() {
  const navItems = [
    { label: 'Accueil', href: '/accueil' },
    { label: 'Imprimantes', href: '/imprimantes' },
    { label: 'Taches', href: '/taches' },
    { label: 'Filaments', href: '/filaments' },
    { label: 'Parametres', href: '/parametres' },
  ];

  return (
    <div className="App">
      <header className="topbar">
        <div className="brand">3D Printing Manager</div>
        <nav className="nav" aria-label="Navigation principale">
          {navItems.map((item) => (
            <a key={item.href} className="nav-link" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>
    </div>
  );
}

export default App;
