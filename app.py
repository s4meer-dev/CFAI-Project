from flask import Flask, render_template, request, jsonify
import time
import random

app = Flask(__name__)

def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/benchmark', methods=['POST'])
def benchmark():
    data = request.json
    alg = data.get('algorithm')
    size = data.get('data_size')
    
    test_data = [random.randint(1, 10000) for _ in range(size)]
    start_time = time.time()
    
    if alg == 'bubble_sort':
        bubble_sort(test_data)
        
    execution_time = time.time() - start_time
    
    return jsonify({"status": "success", "algorithm": alg, "size": size, "execution_time": execution_time})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
