from flask import Flask, render_template, request, jsonify
import time
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/benchmark', methods=['POST'])
def benchmark():
    data = request.json
    alg = data.get('algorithm')
    size = data.get('data_size')
    return jsonify({"status": "success", "algorithm": alg, "size": size})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
