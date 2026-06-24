import { useEffect, useState } from 'react';

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-BE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function OrderDetailsPage({ orderId, onNavigate }) {
  const [orderGroup, setOrderGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrderGroup() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          setError('Groupe de commandes introuvable.');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        setOrderGroup(data);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Impossible de charger le detail du groupe depuis Flask.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrderGroup();

    return () => controller.abort();
  }, [orderId]);

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>{orderGroup ? `Groupe #${orderGroup.id}` : 'Detail groupe'}</h1>
          <p>Commandes liees au groupe envoye par Flask via `/api/orders/{orderId}`.</p>
        </div>
        <a
          className="secondary-button"
          href="/orders"
          onClick={(event) => {
            if (!onNavigate) {
              return;
            }

            event.preventDefault();
            onNavigate('/orders');
          }}
        >
          Retour aux groupes
        </a>
      </div>

      {loading && <div className="state-message">Chargement...</div>}
      {!loading && error && <div className="state-message error">{error}</div>}

      {!loading && !error && orderGroup && (
        <>
          <div className="details-panel">
            <dl className="details-list">
              <div>
                <dt>ID groupe</dt>
                <dd>{orderGroup.id}</dd>
              </div>
              <div>
                <dt>Client</dt>
                <dd>{orderGroup.customer_id}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{orderGroup.status}</dd>
              </div>
              <div>
                <dt>Commandes</dt>
                <dd>{orderGroup.orders_count}</dd>
              </div>
              <div>
                <dt>Commande le</dt>
                <dd>{formatDate(orderGroup.ordered)}</dd>
              </div>
              <div>
                <dt>Date limite</dt>
                <dd>{formatDate(orderGroup.due_date)}</dd>
              </div>
              <div>
                <dt>Prix</dt>
                <dd>{orderGroup.price || '-'}</dd>
              </div>
            </dl>
          </div>

          <div className="table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Status</th>
                  <th>Quantite</th>
                  <th>Fichier 3D</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {orderGroup.orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      Aucune commande liee a ce groupe.
                    </td>
                  </tr>
                ) : (
                  orderGroup.orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.name}</td>
                      <td>{order.status}</td>
                      <td>{order.quantity}</td>
                      <td>{order.three_d_file_id || '-'}</td>
                      <td>{order.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default OrderDetailsPage;
