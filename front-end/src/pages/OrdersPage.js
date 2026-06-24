import { useEffect, useState } from 'react';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/orders/', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('Impossible de charger les commandes depuis Flask.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrders();

    return () => controller.abort();
  }, []);

  return (
    <section className="page-section">
      <div className="section-header">
        <h1>Orders</h1>
        <p>Liste des commandes envoyee par Flask via `/api/orders/`.</p>
      </div>

      {loading && <div className="state-message">Chargement...</div>}
      {!loading && error && <div className="state-message error">{error}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-cell">
                    Aucune commande a afficher.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.name}</td>
                    <td>{order.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default OrdersPage;
