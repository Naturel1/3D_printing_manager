from flask import Blueprint, jsonify, request

from .service import create_order, delete_order, get_order, list_orders, update_order

orders_api_bp = Blueprint("orders_api", __name__)


@orders_api_bp.get("/")
def get_orders():
    return jsonify(list_orders())


@orders_api_bp.get("/<int:order_id>")
def get_single_order(order_id):
    order = get_order(order_id)
    if order is None:
        return jsonify(error="Order not found"), 404

    return jsonify(order)


@orders_api_bp.post("/")
def add_order():
    payload = request.get_json(silent=True) or {}
    if not payload.get("name", "").strip():
        return jsonify(error="Field 'name' is required"), 400

    new_order = create_order(payload)
    return jsonify(new_order), 201


@orders_api_bp.put("/<int:order_id>")
def replace_order(order_id):
    payload = request.get_json(silent=True) or {}
    order = update_order(order_id, payload)
    if order is None:
        return jsonify(error="Order not found"), 404

    return jsonify(order)


@orders_api_bp.delete("/<int:order_id>")
def remove_order(order_id):
    deleted = delete_order(order_id)
    if not deleted:
        return jsonify(error="Order not found"), 404

    return "", 204
