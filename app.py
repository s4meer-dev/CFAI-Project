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

def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] < target:
            low = mid + 1
        elif arr[mid] > target:
            high = mid - 1
        else:
            return mid
    return -1

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/benchmark', methods=['POST'])
def benchmark():
    data = request.json
    alg = data.get('algorithm')
    size = data.get('data_size')
    
    test_data = [random.randint(1, 10000) for _ in range(size)]
    target = test_data[-1] if test_data else -1
    
    start_time = time.time()
    
    if alg == 'bubble_sort':
        bubble_sort(test_data)
    elif alg == 'merge_sort':
        merge_sort(test_data)
    elif alg == 'linear_search':
        linear_search(test_data, target)
    elif alg == 'binary_search':
        test_data.sort() # Ensure sorted array for binary search
        start_time = time.time() # Reset clock after sorting
        binary_search(test_data, target)
        
    execution_time = (time.time() - start_time) * 1000 # Convert to ms
    
    return jsonify({"status": "success", "algorithm": alg, "size": size, "execution_time_ms": execution_time})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
