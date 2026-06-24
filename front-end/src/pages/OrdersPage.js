import { useEffect, useState } from 'react';

function OrdersPage({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    name: '',
    status: 'pending',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [statusEdits, setStatusEdits] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusError, setStatusError] = useState('');

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
        const nextOrders = Array.isArray(data) ? data : [];
        setOrders(nextOrders);
        setStatusEdits(
          nextOrders.reduce(
            (edits, order) => ({
              ...edits,
              [order.id]: order.status,
            }),
            {}
          )
        );
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

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    setFormError('');

    const trimmedName = newOrder.name.trim();
    if (!trimmedName) {
      setFormError('Le nom de la commande est requis.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          status: newOrder.status,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const createdOrder = await response.json();
      setOrders((currentOrders) => [...currentOrders, createdOrder]);
      setStatusEdits((currentEdits) => ({
        ...currentEdits,
        [createdOrder.id]: createdOrder.status,
      }));
      setNewOrder({
        name: '',
        status: 'pending',
      });
      setShowForm(false);
    } catch (createError) {
      setFormError('Impossible de creer la commande dans Flask.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (order) => {
    setStatusError('');
    setUpdatingOrderId(order.id);

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: statusEdits[order.id] || order.status,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const updatedOrder = await response.json();
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === updatedOrder.id ? updatedOrder : currentOrder
        )
      );
      setStatusEdits((currentEdits) => ({
        ...currentEdits,
        [updatedOrder.id]: updatedOrder.status,
      }));
    } catch (updateError) {
      setStatusError('Impossible de modifier le status de la commande.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Orders</h1>
          <p>Liste des commandes envoyee par Flask via `/api/orders/`.</p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            setShowForm((isVisible) => !isVisible);
            setFormError('');
          }}
        >
          Ajouter une commande
        </button>
      </div>

      {showForm && (
        <form className="order-form" onSubmit={handleCreateOrder}>
          <label>
            Nom
            <input
              name="name"
              type="text"
              value={newOrder.name}
              onChange={(event) =>
                setNewOrder((currentOrder) => ({
                  ...currentOrder,
                  name: event.target.value,
                }))
              }
              placeholder="Order 003"
            />
          </label>
          <label>
            Status
            <select
              name="status"
              value={newOrder.status}
              onChange={(event) =>
                setNewOrder((currentOrder) => ({
                  ...currentOrder,
                  status: event.target.value,
                }))
              }
            >
              <option value="pending">pending</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
            </select>
          </label>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Ajout...' : 'Enregistrer'}
          </button>
          {formError && <div className="form-error">{formError}</div>}
        </form>
      )}

      {loading && <div className="state-message">Chargement...</div>}
      {!loading && error && <div className="state-message error">{error}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          {statusError && <div className="state-message error">{statusError}</div>}
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Status</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    Aucune commande a afficher.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                      <a
                        className="table-link"
                        href={`/orders/${order.id}`}
                        onClick={(event) => {
                          if (!onNavigate) {
                            return;
                          }

                          event.preventDefault();
                          onNavigate(`/orders/${order.id}`);
                        }}
                      >
                        {order.name}
                      </a>
                    </td>
                    <td>{order.status}</td>
                    <td>
                      <div className="row-actions">
                        <select
                          aria-label={`Status de ${order.name}`}
                          value={statusEdits[order.id] || order.status}
                          onChange={(event) =>
                            setStatusEdits((currentEdits) => ({
                              ...currentEdits,
                              [order.id]: event.target.value,
                            }))
                          }
                        >
                          <option value="pending">pending</option>
                          <option value="in_progress">in_progress</option>
                          <option value="done">done</option>
                        </select>
                        <button
                          className="secondary-button"
                          type="button"
                          disabled={
                            updatingOrderId === order.id ||
                            (statusEdits[order.id] || order.status) === order.status
                          }
                          onClick={() => handleUpdateStatus(order)}
                        >
                          {updatingOrderId === order.id ? 'Modification...' : 'Modifier'}
                        </button>
                      </div>
                    </td>
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
