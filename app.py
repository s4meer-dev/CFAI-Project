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

def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr)//2
        L = arr[:mid]
        R = arr[mid:]
        merge_sort(L)
        merge_sort(R)
        i = j = k = 0
        while i < len(L) and j < len(R):
            if L[i] < R[j]:
                arr[k] = L[i]
                i += 1
            else:
                arr[k] = R[j]
                j += 1
            k += 1
        while i < len(L):
            arr[k] = L[i]
            i += 1
            k += 1
        while j < len(R):
            arr[k] = R[j]
            j += 1
            k += 1

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
    elif alg == 'merge_sort':
        merge_sort(test_data)
        
    execution_time = time.time() - start_time
    
    return jsonify({"status": "success", "algorithm": alg, "size": size, "execution_time": execution_time})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
