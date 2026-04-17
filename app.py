from flask import Flask, render_template, request
import time

app = Flask(__name__)

# Bubble Sort
def bubble_sort(arr):
    a = arr.copy()
    start = time.time()
    
    n = len(a)
    for i in range(n):
        for j in range(0, n-i-1):
            if a[j] > a[j+1]:
                a[j], a[j+1] = a[j+1], a[j]
    
    end = time.time()
    return round(end - start, 6)

# Merge Sort
def merge_sort(arr):
    start = time.time()

    def merge_sort_recursive(a):
        if len(a) > 1:
            mid = len(a)//2
            L = a[:mid]
            R = a[mid:]

            merge_sort_recursive(L)
            merge_sort_recursive(R)

            i = j = k = 0

            while i < len(L) and j < len(R):
                if L[i] < R[j]:
                    a[k] = L[i]
                    i += 1
                else:
                    a[k] = R[j]
                    j += 1
                k += 1

            while i < len(L):
                a[k] = L[i]
                i += 1
                k += 1

            while j < len(R):
                a[k] = R[j]
                j += 1
                k += 1

    merge_sort_recursive(arr.copy())
    end = time.time()
    return round(end - start, 6)


@app.route('/', methods=['GET', 'POST'])
def index():
    bubble_time = None
    merge_time = None

    if request.method == 'POST':
        numbers = request.form['numbers']
        arr = list(map(int, numbers.split()))

        bubble_time = bubble_sort(arr)
        merge_time = merge_sort(arr)

    return render_template('index.html', bubble=bubble_time, merge=merge_time)


if __name__ == '__main__':
    app.run(debug=True)