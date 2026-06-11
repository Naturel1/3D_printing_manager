from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify(message="Hello from Flask!")

@app.route('/api/data')
def get_data():
    data = {
        "items": ["apple", "banana", "orange"],
        "source": "Flask API"
    }
    return jsonify(data)
if __name__ == '__main__':
    app.run(debug=True)