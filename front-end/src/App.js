import './App.css';

function App() {
  const navItems = [
    { label: 'hub', href: '/' },
    { label: 'Orders', href: '/orders' },
    { label: 'Printers', href: '/printers' },
    { label: 'Filaments', href: '/filaments' },
    { label: 'Customers', href: '/customers' },
    {label: 'Price calculator', href: '/pricecalculator' },
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
