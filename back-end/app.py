from flask import Flask, jsonify

from orders import orders_api_bp

app = Flask(__name__)
app.register_blueprint(orders_api_bp, url_prefix="/api/orders")


@app.route("/")
def home():
    return jsonify(message="Hello from Flask!")


@app.route("/api/data")
def get_data():
    data = {
        "items": ["apple", "banana", "orange"],
        "source": "Flask API",
    }
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
