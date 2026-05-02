from flask import Flask, render_template, request, jsonify
import time
import random
import math
import tracemalloc

app = Flask(__name__)

def bubble_sort(arr):
    """
    Sorts an array using the Bubble Sort algorithm.
    Time Complexity: O(n^2), Space Complexity: O(1)
    """
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

def selection_sort(arr):
    """
    Sorts an array using the Selection Sort algorithm.
    Time Complexity: O(n^2), Space Complexity: O(1)
    """
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i+1, n):
            if arr[min_idx] > arr[j]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

def insertion_sort(arr):
    """
    Sorts an array using the Insertion Sort algorithm.
    Time Complexity: O(n^2), Space Complexity: O(1)
    Building the final sorted array one item at a time.
    """
    for i in range(1, len(arr)):
        key = arr[i]
        j = i-1
        while j >= 0 and key < arr[j]:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key
    return arr

def merge_sort(arr):
    """
    Sorts an array using the Merge Sort algorithm.
    Time Complexity: O(n log n), Space Complexity: O(n)
    Divide and conquer strategy with merging.
    """
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
    """
    Sorts an array using the Quick Sort algorithm.
    Time Complexity: O(n log n) average, O(n^2) worst case.
    Space Complexity: O(log n)
    Partition-based divide and conquer.
    """
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

def heapify(arr, n, i):
    largest = i
    l = 2 * i + 1
    r = 2 * i + 2
    if l < n and arr[i] < arr[l]:
        largest = l
    if r < n and arr[largest] < arr[r]:
        largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    """
    Sorts an array using the Heap Sort algorithm.
    Time Complexity: O(n log n), Space Complexity: O(1)
    """
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n-1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)
    return arr

def shell_sort(arr):
    """
    Sorts an array using the Shell Sort algorithm.
    Time Complexity: O(n log n) to O(n^2) depending on gap, Space Complexity: O(1)
    """
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr

def counting_sort(arr):
    """
    Sorts an array using the Counting Sort algorithm.
    Time Complexity: O(n + k), Space Complexity: O(k) where k is the range of input.
    Note: Only works for non-negative integers.
    """
    if not arr:
        return arr
    max_val = max(arr)
    count = [0] * (max_val + 1)
    for x in arr:
        count[x] += 1
    for i in range(1, len(count)):
        count[i] += count[i-1]
    output = [0] * len(arr)
    for i in range(len(arr)-1, -1, -1):
        output[count[arr[i]]-1] = arr[i]
        count[arr[i]] -= 1
    for i in range(len(arr)):
        arr[i] = output[i]
    return arr

def linear_search(arr, target):
    """
    Finds target in an array using Linear Search.
    Time Complexity: O(n), Space Complexity: O(1)
    Scanning each element one by one.
    """
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

def jump_search(arr, target):
    """
    Finds target in a sorted array using Jump Search.
    Time Complexity: O(sqrt(n)), Space Complexity: O(1)
    Jumps through the array in fixed steps.
    """
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
    """
    Finds target in a sorted array using Binary Search.
    Time Complexity: O(log n), Space Complexity: O(1)
    Repeatedly dividing the search interval in half.
    """
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

def exponential_search(arr, target):
    """
    Finds target in a sorted array using Exponential Search.
    Time Complexity: O(log i) where i is the position of target.
    """
    if not arr:
        return -1
    if arr[0] == target:
        return 0
    n = len(arr)
    i = 1
    while i < n and arr[i] <= target:
        i = i * 2
    
    # Binary search in range [i/2, min(i, n-1)]
    low = i // 2
    high = min(i, n - 1)
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] < target:
            low = mid + 1
        elif arr[mid] > target:
            high = mid - 1
        else:
            return mid
    return -1

def generate_test_data(size, data_type):
    """
    Generates test data based on size and type.
    """
    if data_type == 'sorted':
        return list(range(size))
    elif data_type == 'reversed':
        return list(range(size, 0, -1))
    else: # random
        return [random.randint(1, 10000) for _ in range(size)]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/benchmark', methods=['POST'])
def benchmark():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No input data provided"}), 400
        
    alg = data.get('algorithm')
    if not alg:
        return jsonify({"status": "error", "message": "No algorithm specified"}), 400
        
    size = data.get('data_size', 1000)
    if not isinstance(size, int) or size <= 0:
        return jsonify({"status": "error", "message": "Invalid data size"}), 400
        
    data_type = data.get('data_type', 'random')
    iterations = data.get('iterations', 1)
    if not isinstance(iterations, int) or iterations <= 0:
        return jsonify({"status": "error", "message": "Invalid iterations"}), 400
    
    total_time = 0
    total_memory = 0
    
    for _ in range(iterations):
        test_data = generate_test_data(size, data_type)
        target = test_data[-1] if test_data else -1
        
        tracemalloc.start()
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
        elif alg == 'heap_sort':
            heap_sort(test_data)
        elif alg == 'shell_sort':
            shell_sort(test_data)
        elif alg == 'counting_sort':
            counting_sort(test_data)
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
        elif alg == 'exponential_search':
            if data_type == 'random': test_data.sort()
            start_time = time.time()
            exponential_search(test_data, target)
            
        execution_time = (time.time() - start_time) * 1000
        current_mem, peak_mem = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        
        total_time += execution_time
        total_memory += peak_mem
        
    avg_execution_time = total_time / iterations
    avg_memory_usage = total_memory / iterations
    
    return jsonify({
        "status": "success", 
        "algorithm": alg, 
        "size": size, 
        "data_type": data_type,
        "iterations": iterations,
        "execution_time_ms": avg_execution_time,
        "memory_usage_bytes": avg_memory_usage
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
