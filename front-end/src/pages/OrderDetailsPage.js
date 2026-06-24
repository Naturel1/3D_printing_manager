import { useEffect, useState } from 'react';

function OrderDetailsPage({ orderId, onNavigate }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrder() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          setError('Commande introuvable.');
          return;
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setOrder(data);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('Impossible de charger le detail de la commande depuis Flask.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrder();

    return () => controller.abort();
  }, [orderId]);

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>{order ? order.name : 'Detail commande'}</h1>
          <p>Detail de la commande envoye par Flask via `/api/orders/{orderId}`.</p>
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
          Retour aux commandes
        </a>
      </div>

      {loading && <div className="state-message">Chargement...</div>}
      {!loading && error && <div className="state-message error">{error}</div>}

      {!loading && !error && order && (
        <div className="details-panel">
          <dl className="details-list">
            <div>
              <dt>ID</dt>
              <dd>{order.id}</dd>
            </div>
            <div>
              <dt>Nom</dt>
              <dd>{order.name}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{order.status}</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}

export default OrderDetailsPage;
