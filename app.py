from flask import Flask, render_template, jsonify

app = Flask(__name__)

COMPLEXITY_MAP = {
    'bubble_sort':       {'time': 'O(n\u00b2)',       'space': 'O(1)'},
    'selection_sort':    {'time': 'O(n\u00b2)',       'space': 'O(1)'},
    'insertion_sort':    {'time': 'O(n\u00b2)',       'space': 'O(1)'},
    'merge_sort':        {'time': 'O(n log n)',  'space': 'O(n)'},
    'quick_sort':        {'time': 'O(n log n)',  'space': 'O(log n)'},
    'heap_sort':         {'time': 'O(n log n)',  'space': 'O(1)'},
    'shell_sort':        {'time': 'O(n log n)',  'space': 'O(1)'},
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/complexity', methods=['GET'])
def get_complexity():
    return jsonify(COMPLEXITY_MAP)

if __name__ == '__main__':
    app.run(debug=True, port=5000)