class Visualizer {
    constructor(canvasId, color) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.color = color;
        this.array = [];
        this.initialArray = [];
        this.actions = [];
        this.currentStep = 0;
        this.sortedIndices = new Set();
        this.opsCount = 0;
        this.currentAlgo = 'bubble_sort';
        this.isComplete = false;
        this.highlights = {};
    }

    setArray(arr) {
        this.initialArray = [...arr];
        this.array = [...arr];
        this.sortedIndices = new Set();
        this.opsCount = 0;
        this.currentStep = 0;
        this.isComplete = false;
        this.highlights = {};
        if (this.canvas.offsetWidth > 0) this.canvas.width = this.canvas.offsetWidth;
        this.precomputeActions();
        this.draw();
    }

    setAlgorithm(algo) {
        this.currentAlgo = algo;
        this.array = [...this.initialArray];
        this.sortedIndices = new Set();
        this.opsCount = 0;
        this.currentStep = 0;
        this.isComplete = false;
        this.highlights = {};
        this.precomputeActions();
        this.draw();
    }

    precomputeActions() {
        this.actions = [];
        const arr = [...this.initialArray];
        
        const compare = (i, j) => { this.actions.push({ type: 'compare', indices: [i, j] }); };
        const swap = (i, j) => { 
            this.actions.push({ type: 'swap', indices: [i, j] }); 
            const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
        };
        const overwrite = (i, val) => {
            this.actions.push({ type: 'overwrite', index: i, value: val, oldValue: arr[i] });
            arr[i] = val;
        };
        const markSorted = (i) => { this.actions.push({ type: 'sorted', index: i }); };
        
        const n = arr.length;
        if (n === 0) return;

        switch (this.currentAlgo) {
            case 'bubble_sort':
                for (let i = 0; i < n - 1; i++) {
                    for (let j = 0; j < n - i - 1; j++) {
                        compare(j, j + 1);
                        if (arr[j] > arr[j + 1]) swap(j, j + 1);
                    }
                    markSorted(n - 1 - i);
                }
                markSorted(0);
                break;

            case 'selection_sort':
                for (let i = 0; i < n - 1; i++) {
                    let minIdx = i;
                    for (let j = i + 1; j < n; j++) {
                        compare(minIdx, j);
                        if (arr[j] < arr[minIdx]) minIdx = j;
                    }
                    if (minIdx !== i) swap(i, minIdx);
                    markSorted(i);
                }
                markSorted(n - 1);
                break;

            case 'insertion_sort':
                markSorted(0);
                for (let i = 1; i < n; i++) {
                    let key = arr[i];
                    let j = i - 1;
                    let hole = i;
                    
                    while (j >= 0) {
                        compare(j, hole);
                        if (arr[j] > key) {
                            overwrite(hole, arr[j]);
                            hole = j;
                            j--;
                        } else {
                            break;
                        }
                    }
                    overwrite(hole, key);
                    markSorted(i);
                }
                break;

            case 'merge_sort':
                const mergeSort = (lo, hi) => {
                    if (lo >= hi) return;
                    const mid = Math.floor((lo + hi) / 2);
                    mergeSort(lo, mid);
                    mergeSort(mid + 1, hi);
                    
                    let i = lo, j = mid + 1;
                    const temp = [];
                    while (i <= mid && j <= hi) {
                        compare(i, j);
                        if (arr[i] <= arr[j]) {
                            temp.push(arr[i++]);
                        } else {
                            temp.push(arr[j++]);
                        }
                    }
                    while (i <= mid) temp.push(arr[i++]);
                    while (j <= hi) temp.push(arr[j++]);
                    
                    for (let k = lo; k <= hi; k++) {
                        overwrite(k, temp[k - lo]);
                    }
                };
                mergeSort(0, n - 1);
                for (let i = 0; i < n; i++) markSorted(i);
                break;

            case 'quick_sort':
                const stack = [[0, n - 1]];
                while (stack.length) {
                    const [lo, hi] = stack.pop();
                    if (lo >= hi) {
                        if (lo === hi) markSorted(lo);
                        continue;
                    }
                    const pivot = arr[hi];
                    let i = lo - 1;
                    for (let j = lo; j < hi; j++) {
                        compare(j, hi);
                        if (arr[j] <= pivot) {
                            i++;
                            swap(i, j);
                        }
                    }
                    swap(i + 1, hi);
                    const p = i + 1;
                    markSorted(p);
                    stack.push([lo, p - 1]);
                    stack.push([p + 1, hi]);
                }
                break;

            case 'heap_sort':
                const heapify = (size, i) => {
                    let largest = i;
                    const l = 2 * i + 1;
                    const r = 2 * i + 2;
                    
                    if (l < size) {
                        compare(l, largest);
                        if (arr[l] > arr[largest]) largest = l;
                    }
                    if (r < size) {
                        compare(r, largest);
                        if (arr[r] > arr[largest]) largest = r;
                    }
                    
                    if (largest !== i) {
                        swap(i, largest);
                        heapify(size, largest);
                    }
                };

                for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
                
                for (let i = n - 1; i > 0; i--) {
                    swap(0, i);
                    markSorted(i);
                    heapify(i, 0);
                }
                markSorted(0);
                break;

            case 'shell_sort':
                for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
                    for (let i = gap; i < n; i++) {
                        let temp = arr[i];
                        let j = i;
                        let hole = i;
                        
                        while (j >= gap) {
                            compare(j - gap, hole);
                            if (arr[j - gap] > temp) {
                                overwrite(hole, arr[j - gap]);
                                hole = j - gap;
                                j -= gap;
                            } else {
                                break;
                            }
                        }
                        overwrite(hole, temp);
                    }
                }
                for (let i = 0; i < n; i++) markSorted(i);
                break;
        }
    }

    draw() {
        const { canvas, ctx, array, sortedIndices, color, highlights } = this;
        if (!ctx) return;

        if (canvas.offsetWidth > 0 && canvas.width !== canvas.offsetWidth) {
            canvas.width = canvas.offsetWidth;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (array.length === 0) return;

        const barWidth = canvas.width / array.length;
        const maxVal = Math.max(...array, 1);

        array.forEach((val, i) => {
            const barHeight = (val / maxVal) * (canvas.height - 10);
            
            let fillColor = color;
            if (sortedIndices.has(i)) fillColor = '#22c55e'; // green
            if (highlights[i] === 'compare') fillColor = '#facc15'; // yellow
            if (highlights[i] === 'swap') fillColor = '#ef4444'; // red

            ctx.fillStyle = fillColor;
            
            if (barWidth < 3) {
                ctx.fillRect(
                    i * barWidth,
                    canvas.height - barHeight,
                    barWidth > 1 ? barWidth : 1,
                    barHeight
                );
            } else {
                ctx.beginPath();
                ctx.roundRect(
                    i * barWidth + 1,
                    canvas.height - barHeight,
                    barWidth - 2,
                    barHeight,
                    [4, 4, 0, 0]
                );
                ctx.fill();
            }
        });
    }

    step() {
        if (this.currentStep >= this.actions.length) {
            this.isComplete = true;
            this.highlights = {};
            this.draw();
            return false;
        }

        const action = this.actions[this.currentStep];
        this.highlights = {};

        if (action.type === 'compare') {
            this.highlights[action.indices[0]] = 'compare';
            this.highlights[action.indices[1]] = 'compare';
            this.opsCount++;
        } else if (action.type === 'swap') {
            const [i, j] = action.indices;
            const temp = this.array[i];
            this.array[i] = this.array[j];
            this.array[j] = temp;
            this.highlights[i] = 'swap';
            this.highlights[j] = 'swap';
            this.opsCount++;
        } else if (action.type === 'overwrite') {
            this.array[action.index] = action.value;
            this.highlights[action.index] = 'swap'; // use swap color for overwrites
            this.opsCount++;
        } else if (action.type === 'sorted') {
            this.sortedIndices.add(action.index);
        }

        this.currentStep++;
        this.isComplete = this.currentStep >= this.actions.length;
        this.draw();
        return true;
    }

    stepBack() {
        if (this.currentStep <= 0) return false;
        
        this.isComplete = false;
        this.currentStep--;
        const action = this.actions[this.currentStep];
        this.highlights = {};

        if (this.currentStep > 0) {
            const prevAction = this.actions[this.currentStep - 1];
            if (prevAction.type !== 'sorted') {
                prevAction.indices.forEach(idx => {
                    this.highlights[idx] = prevAction.type;
                });
            }
        }

        if (action.type === 'compare') {
            this.opsCount--;
        } else if (action.type === 'swap') {
            const [i, j] = action.indices;
            const temp = this.array[i];
            this.array[i] = this.array[j];
            this.array[j] = temp;
            this.opsCount--;
        } else if (action.type === 'overwrite') {
            this.array[action.index] = action.oldValue;
            this.opsCount--;
        } else if (action.type === 'sorted') {
            this.sortedIndices.delete(action.index);
        }

        this.draw();
        return true;
    }
}
