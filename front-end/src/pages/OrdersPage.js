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

function OrdersPage({ onNavigate }) {
  const [orderGroups, setOrderGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newOrderGroup, setNewOrderGroup] = useState({
    customer_id: '',
    due_date: '',
    price: '',
    name: '',
    status: 'pending',
    quantity: 1,
    note: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrderGroups() {
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
        setOrderGroups(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('Impossible de charger les groupes de commandes depuis Flask.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrderGroups();

    return () => controller.abort();
  }, []);

  const handleCreateOrderGroup = async (event) => {
    event.preventDefault();
    setFormError('');

    const trimmedName = newOrderGroup.name.trim();
    if (!newOrderGroup.customer_id) {
      setFormError('Le client est requis.');
      return;
    }

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
          customer_id: newOrderGroup.customer_id,
          due_date: newOrderGroup.due_date,
          price: newOrderGroup.price,
          name: trimmedName,
          status: newOrderGroup.status,
          quantity: newOrderGroup.quantity,
          note: newOrderGroup.note,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const createdOrderGroup = await response.json();
      setOrderGroups((currentOrderGroups) => [...currentOrderGroups, createdOrderGroup]);
      setNewOrderGroup({
        customer_id: '',
        due_date: '',
        price: '',
        name: '',
        status: 'pending',
        quantity: 1,
        note: '',
      });
      setShowForm(false);
    } catch (createError) {
      setFormError(createError.message || 'Impossible de creer le groupe de commandes dans Flask.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Orders</h1>
          <p>Liste des groupes de commandes envoyee par Flask via `/api/orders/`.</p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            setShowForm((isVisible) => !isVisible);
            setFormError('');
          }}
        >
          Ajouter un groupe
        </button>
      </div>

      {showForm && (
        <form className="order-form" onSubmit={handleCreateOrderGroup}>
          <label>
            Client
            <input
              name="customer_id"
              type="number"
              min="1"
              value={newOrderGroup.customer_id}
              onChange={(event) =>
                setNewOrderGroup((currentOrderGroup) => ({
                  ...currentOrderGroup,
                  customer_id: event.target.value,
                }))
              }
              placeholder="1"
            />
          </label>
          <label>
            Date limite
            <input
              name="due_date"
              type="datetime-local"
              value={newOrderGroup.due_date}
              onChange={(event) =>
                setNewOrderGroup((currentOrderGroup) => ({
                  ...currentOrderGroup,
                  due_date: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Prix
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={newOrderGroup.price}
              onChange={(event) =>
                setNewOrderGroup((currentOrderGroup) => ({
                  ...currentOrderGroup,
                  price: event.target.value,
                }))
              }
              placeholder="0.00"
            />
          </label>
          <label>
            Commande
            <input
              name="name"
              type="text"
              value={newOrderGroup.name}
              onChange={(event) =>
                setNewOrderGroup((currentOrderGroup) => ({
                  ...currentOrderGroup,
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
              value={newOrderGroup.status}
              onChange={(event) =>
                setNewOrderGroup((currentOrderGroup) => ({
                  ...currentOrderGroup,
                  status: event.target.value,
                }))
              }
            >
              <option value="pending">pending</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
            </select>
          </label>
          <label>
            Quantite
            <input
              name="quantity"
              type="number"
              min="1"
              value={newOrderGroup.quantity}
              onChange={(event) =>
                setNewOrderGroup((currentOrderGroup) => ({
                  ...currentOrderGroup,
                  quantity: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Note
            <input
              name="note"
              type="text"
              value={newOrderGroup.note}
              onChange={(event) =>
                setNewOrderGroup((currentOrderGroup) => ({
                  ...currentOrderGroup,
                  note: event.target.value,
                }))
              }
              placeholder="Optionnel"
            />
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
          <table className="orders-table">
            <thead>
              <tr>
                <th>Groupe</th>
                <th>Client</th>
                <th>Status</th>
                <th>Commandes</th>
                <th>Commande le</th>
                <th>Date limite</th>
                <th>Prix</th>
              </tr>
            </thead>
            <tbody>
              {orderGroups.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    Aucun groupe de commandes a afficher.
                  </td>
                </tr>
              ) : (
                orderGroups.map((orderGroup) => (
                  <tr key={orderGroup.id}>
                    <td>
                      <a
                        className="table-link"
                        href={`/orders/${orderGroup.id}`}
                        onClick={(event) => {
                          if (!onNavigate) {
                            return;
                          }

                          event.preventDefault();
                          onNavigate(`/orders/${orderGroup.id}`);
                        }}
                      >
                        Groupe #{orderGroup.id}
                      </a>
                    </td>
                    <td>{orderGroup.customer_id}</td>
                    <td>{orderGroup.status}</td>
                    <td>{orderGroup.orders_count}</td>
                    <td>{formatDate(orderGroup.ordered)}</td>
                    <td>{formatDate(orderGroup.due_date)}</td>
                    <td>{orderGroup.price || '-'}</td>
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
