from flask import Flask, render_template, request, jsonify
import time
import random
import math

app = Flask(__name__)

def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

    return arr

def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i+1, n):
            if arr[min_idx] > arr[j]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i-1
        while j >= 0 and key < arr[j]:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key
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

def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

    return -1

def jump_search(arr, target):
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    while arr[min(step, n)-1] < target:
        prev = step
        step += int(math.sqrt(n))
        if prev >= n:
            return -1
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n):
            return -1
    if arr[prev] == target:
        return prev
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
    size = data.get('data_size', 1000)
    data_type = data.get('data_type', 'random')
    iterations = data.get('iterations', 1)
    
    total_time = 0
    
    for _ in range(iterations):
        # Generate data based on type
        if data_type == 'sorted':
            test_data = list(range(size))
        elif data_type == 'reversed':
            test_data = list(range(size, 0, -1))
        else: # random
            test_data = [random.randint(1, 10000) for _ in range(size)]
            
        target = test_data[-1] if test_data else -1
        
        start_time = time.time()
        
        if alg == 'bubble_sort':
            bubble_sort(test_data)
        elif alg == 'selection_sort':
            selection_sort(test_data)
        elif alg == 'insertion_sort':
            insertion_sort(test_data)
        elif alg == 'merge_sort':
            merge_sort(test_data)
        elif alg == 'quick_sort':
            quick_sort(test_data)
        elif alg == 'linear_search':
            linear_search(test_data, target)
        elif alg == 'binary_search':
            if data_type == 'random': test_data.sort()
            start_time = time.time()
            binary_search(test_data, target)
        elif alg == 'jump_search':
            if data_type == 'random': test_data.sort()
            start_time = time.time()
            jump_search(test_data, target)
            
        total_time += (time.time() - start_time) * 1000
        
    avg_execution_time = total_time / iterations
    
    return jsonify({
        "status": "success", 
        "algorithm": alg, 
        "size": size, 
        "data_type": data_type,
        "iterations": iterations,
        "execution_time_ms": avg_execution_time
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
