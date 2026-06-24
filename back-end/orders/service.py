from datetime import datetime
from decimal import Decimal, InvalidOperation

from db.database import session_scope
from db.repository import OrderRepository


VALID_STATUSES = {"pending", "in_progress", "done"}

repository = OrderRepository()


class OrderValidationError(ValueError):
    pass


def list_orders():
    with session_scope() as session:
        return [_serialize_order_group(order_group) for order_group in repository.list_groups(session)]


def get_order(order_id):
    with session_scope() as session:
        order_group = repository.get_group(session, order_id)
        return _serialize_order_group_detail(order_group) if order_group else None


def create_order(payload):
    order_group_data = _payload_to_order_group_data(payload)
    order_data = _payload_to_order_data(payload, require_create_fields=True)

    try:
        with session_scope() as session:
            order_group = repository.create_group_with_order(session, order_group_data, order_data)
            return _serialize_order_group_detail(order_group)
    except ValueError as error:
        raise OrderValidationError(str(error)) from error


def update_order(order_id, payload):
    order_data = _payload_to_order_data(payload, require_create_fields=False)

    try:
        with session_scope() as session:
            order = repository.update(session, order_id, order_data)
            return _serialize_order(order) if order else None
    except ValueError as error:
        raise OrderValidationError(str(error)) from error


def delete_order(order_id):
    with session_scope() as session:
        return repository.delete(session, order_id)


def _serialize_order(order):
    return {
        "id": order.id,
        "name": order.name,
        "status": order.status,
        "order_group_id": order.order_group_id,
        "note": order.note,
        "three_d_file_id": order.three_d_file_id,
        "quantity": order.quantity,
    }


def _serialize_order_group(order_group):
    orders = list(order_group.orders)

    return {
        "id": order_group.id,
        "customer_id": order_group.customer_id,
        "ordered": _serialize_datetime(order_group.ordered),
        "due_date": _serialize_datetime(order_group.due_date),
        "sended": _serialize_datetime(order_group.sended),
        "arrived": _serialize_datetime(order_group.arrived),
        "price": str(order_group.price) if order_group.price is not None else None,
        "orders_count": len(orders),
        "status": _group_status(orders),
    }


def _serialize_order_group_detail(order_group):
    group_data = _serialize_order_group(order_group)
    group_data["orders"] = [_serialize_order(order) for order in order_group.orders]
    return group_data


def _payload_to_order_group_data(payload):
    order_group_data = {}

    if "customer_id" not in payload:
        raise OrderValidationError("Field 'customer_id' is required")
    order_group_data["customer_id"] = _positive_int(payload["customer_id"], "customer_id")

    if "ordered" in payload:
        order_group_data["ordered"] = _datetime_value(payload["ordered"], "ordered")

    if "due_date" in payload:
        order_group_data["due_date"] = _optional_datetime_value(payload["due_date"], "due_date")

    if "sended" in payload:
        order_group_data["sended"] = _optional_datetime_value(payload["sended"], "sended")

    if "arrived" in payload:
        order_group_data["arrived"] = _optional_datetime_value(payload["arrived"], "arrived")

    if "price" in payload:
        order_group_data["price"] = _optional_decimal(payload["price"], "price")

    return order_group_data


def _payload_to_order_data(payload, require_create_fields):
    order_data = {}

    if "name" in payload:
        order_data["name"] = _clean_required_text(payload["name"], "name")
    elif require_create_fields:
        raise OrderValidationError("Field 'name' is required")

    if "status" in payload:
        status = _clean_required_text(payload["status"], "status")
        if status not in VALID_STATUSES:
            raise OrderValidationError("Field 'status' is invalid")
        order_data["status"] = status
    elif require_create_fields:
        order_data["status"] = "pending"

    if "order_group_id" in payload:
        order_data["order_group_id"] = _positive_int(payload["order_group_id"], "order_group_id")

    if "quantity" in payload:
        order_data["quantity"] = _positive_int(payload["quantity"], "quantity")
    elif require_create_fields:
        order_data["quantity"] = 1

    if "note" in payload:
        note = payload["note"]
        order_data["note"] = note.strip() if isinstance(note, str) and note.strip() else None

    if "three_d_file_id" in payload:
        three_d_file_id = payload["three_d_file_id"]
        order_data["three_d_file_id"] = (
            _positive_int(three_d_file_id, "three_d_file_id")
            if three_d_file_id not in (None, "")
            else None
        )

    return order_data


def _clean_required_text(value, field_name):
    if not isinstance(value, str) or not value.strip():
        raise OrderValidationError(f"Field '{field_name}' is required")

    return value.strip()


def _positive_int(value, field_name):
    try:
        parsed_value = int(value)
    except (TypeError, ValueError) as error:
        raise OrderValidationError(f"Field '{field_name}' must be a positive integer") from error

    if parsed_value <= 0:
        raise OrderValidationError(f"Field '{field_name}' must be a positive integer")

    return parsed_value


def _optional_datetime_value(value, field_name):
    if value in (None, ""):
        return None

    return _datetime_value(value, field_name)


def _datetime_value(value, field_name):
    if not isinstance(value, str) or not value.strip():
        raise OrderValidationError(f"Field '{field_name}' must be a date")

    normalized_value = value.strip()
    if normalized_value.endswith("Z"):
        normalized_value = f"{normalized_value[:-1]}+00:00"

    try:
        return datetime.fromisoformat(normalized_value)
    except ValueError as error:
        raise OrderValidationError(f"Field '{field_name}' must be a valid ISO date") from error


def _optional_decimal(value, field_name):
    if value in (None, ""):
        return None

    try:
        parsed_value = Decimal(str(value))
    except (InvalidOperation, ValueError) as error:
        raise OrderValidationError(f"Field '{field_name}' must be a positive number") from error

    if parsed_value < 0:
        raise OrderValidationError(f"Field '{field_name}' must be a positive number")

    return parsed_value


def _serialize_datetime(value):
    return value.isoformat() if value else None


def _group_status(orders):
    if not orders:
        return "empty"

    statuses = {order.status for order in orders}
    if statuses == {"done"}:
        return "done"
    if "in_progress" in statuses:
        return "in_progress"
    return "pending"
