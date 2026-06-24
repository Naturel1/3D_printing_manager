_orders = [
    {
        "id": 1,
        "name": "Order 001",
        "status": "pending",
    },
    {
        "id": 2,
        "name": "Order 002",
        "status": "in_progress",
    },
]


def list_orders():
    return _orders


def get_order(order_id):
    return next((order for order in _orders if order["id"] == order_id), None)


def create_order(payload):
    new_id = max((order["id"] for order in _orders), default=0) + 1
    new_order = {
        "id": new_id,
        "name": payload.get("name", f"Order {new_id:03d}").strip(),
        "status": payload.get("status", "pending"),
    }
    _orders.append(new_order)
    return new_order


def update_order(order_id, payload):
    order = get_order(order_id)
    if order is None:
        return None

    order["name"] = payload.get("name", order["name"])
    order["status"] = payload.get("status", order["status"])
    return order


def delete_order(order_id):
    order = get_order(order_id)
    if order is None:
        return False

    _orders.remove(order)
    return True
