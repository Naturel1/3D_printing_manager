import { useEffect, useMemo, useState } from 'react';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrdersPage from './pages/OrdersPage';
import './App.css';

function normalizePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function App() {
  const navItems = useMemo(
    () => [
      { label: 'hub', href: '/' },
      { label: 'Orders', href: '/orders' },
      { label: 'Printers', href: '/printers' },
      { label: 'Filaments', href: '/filaments' },
      { label: 'Customers', href: '/customers' },
      { label: 'Price calculator', href: '/pricecalculator' },
      { label: 'Parametres', href: '/parametres' },
    ],
    []
  );

  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  useEffect(() => {
    const onPopState = () => {
      setPath(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (href) => {
    const nextPath = normalizePath(href);

    if (nextPath === path) {
      return;
    }

    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  };

  const renderContent = () => {
    if (path === '/orders') {
      return <OrdersPage onNavigate={navigate} />;
    }

    const orderDetailsMatch = path.match(/^\/orders\/(\d+)$/);
    if (orderDetailsMatch) {
      return <OrderDetailsPage orderId={orderDetailsMatch[1]} onNavigate={navigate} />;
    }

    return (
      <section className="page-section">
        <div className="section-header">
          <h1>{path === '/' ? 'hub' : path.slice(1)}</h1>
          <p>Placeholder React. La route existe cote front, la logique metier reste dans Flask.</p>
        </div>
      </section>
    );
  };

  return (
    <div className="App">
      <header className="topbar">
        <div className="brand">3D Printing Manager</div>
        <nav className="nav" aria-label="Navigation principale">
          {navItems.map((item) => (
            <a
              key={item.href}
              className={`nav-link ${normalizePath(item.href) === path ? 'active' : ''}`}
              href={item.href}
              onClick={(event) => {
                event.preventDefault();
                navigate(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="main-content">{renderContent()}</main>
    </div>
  );
}

export default App;
