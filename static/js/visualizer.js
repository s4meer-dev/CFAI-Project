class Visualizer {
    constructor(canvasId, color) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.color = color;
        this.array = [];
        this.generator = null;
        this.sortedIndices = new Set();
        this.opsCount = 0;
        this.isComplete = false;
        this.currentAlgo = 'bubble_sort';
    }

    setArray(arr) {
        this.array = [...arr];
        this.generator = null;
        this.sortedIndices = new Set();
        this.opsCount = 0;
        this.isComplete = false;
        if (this.canvas.offsetWidth > 0) this.canvas.width = this.canvas.offsetWidth;
        this.draw();
    }

    setAlgorithm(algo) {
        this.currentAlgo = algo;
        this.generator = null;
        this.sortedIndices = new Set();
        this.opsCount = 0;
        this.isComplete = false;
        this.draw();
    }

    draw(highlights = {}) {
        const { canvas, ctx, array, sortedIndices, color } = this;
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
            if (sortedIndices.has(i)) fillColor = '#22c55e'; // green (sorted)
            if (highlights[i] === 'compare') fillColor = '#facc15'; // yellow
            if (highlights[i] === 'swap') fillColor = '#ef4444'; // red

            ctx.fillStyle = fillColor;
            
            // Draw standard rect if width is too small for rounded corners (perf optimization for large arrays)
            if (barWidth < 3) {
                ctx.fillRect(
                    i * barWidth,
                    canvas.height - barHeight,
                    barWidth > 1 ? barWidth : 1, // Ensure it's at least 1px wide
                    barHeight
                );
            } else {
                // Draw rounded top bar
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
        if (this.isComplete) return false;

        if (!this.generator) {
            switch (this.currentAlgo) {
                case 'bubble_sort':    this.generator = this.bubbleSortSteps([...this.array]); break;
                case 'selection_sort': this.generator = this.selectionSortSteps([...this.array]); break;
                case 'insertion_sort': this.generator = this.insertionSortSteps([...this.array]); break;
                case 'merge_sort':     this.generator = this.mergeSortSteps([...this.array]); break;
                case 'quick_sort':     this.generator = this.quickSortSteps([...this.array]); break;
                case 'heap_sort':      this.generator = this.heapSortSteps([...this.array]); break;
                case 'shell_sort':     this.generator = this.shellSortSteps([...this.array]); break;
                default:               this.generator = this.bubbleSortSteps([...this.array]);
            }
        }

        const result = this.generator.next();
        if (!result.done) {
            const { arr, indices, action } = result.value;
            this.array = arr;
            this.opsCount++;
            
            const highlights = {};
            indices.forEach(idx => { highlights[idx] = action; });
            this.draw(highlights);
            return true;
        } else {
            this.array = result.value.arr || this.array;
            this.array.forEach((_, i) => this.sortedIndices.add(i));
            this.isComplete = true;
            this.draw();
            return false;
        }
    }

    *bubbleSortSteps(arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                yield { arr: [...arr], indices: [j, j + 1], action: 'compare' };
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    yield { arr: [...arr], indices: [j, j + 1], action: 'swap' };
                }
            }
            this.sortedIndices.add(n - 1 - i);
        }
        this.sortedIndices.add(0);
        return { arr };
    }

    *selectionSortSteps(arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                yield { arr: [...arr], indices: [minIdx, j], action: 'compare' };
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            if (minIdx !== i) {
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                yield { arr: [...arr], indices: [i, minIdx], action: 'swap' };
            }
            this.sortedIndices.add(i);
        }
        this.sortedIndices.add(n - 1);
        return { arr };
    }

    *insertionSortSteps(arr) {
        const n = arr.length;
        this.sortedIndices.add(0);
        for (let i = 1; i < n; i++) {
            let j = i;
            while (j > 0) {
                yield { arr: [...arr], indices: [j - 1, j], action: 'compare' };
                if (arr[j] < arr[j - 1]) {
                    [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
                    yield { arr: [...arr], indices: [j - 1, j], action: 'swap' };
                    j--;
                } else {
                    break;
                }
            }
            this.sortedIndices.add(i);
        }
        return { arr };
    }

    *mergeSortSteps(arr) {
        const n = arr.length;
        for (let width = 1; width < n; width *= 2) {
            for (let lo = 0; lo < n; lo += 2 * width) {
                const mid = Math.min(lo + width, n);
                const hi = Math.min(lo + 2 * width, n);
                const left = arr.slice(lo, mid);
                const right = arr.slice(mid, hi);
                let i = 0, j = 0, k = lo;
                while (i < left.length && j < right.length) {
                    yield { arr: [...arr], indices: [lo + i, mid + j], action: 'compare' };
                    if (left[i] <= right[j]) {
                        arr[k++] = left[i++];
                    } else {
                        arr[k++] = right[j++];
                    }
                    yield { arr: [...arr], indices: [k - 1], action: 'swap' };
                }
                while (i < left.length) { 
                    arr[k++] = left[i++]; 
                    yield { arr: [...arr], indices: [k - 1], action: 'swap' };
                }
                while (j < right.length) { 
                    arr[k++] = right[j++]; 
                    yield { arr: [...arr], indices: [k - 1], action: 'swap' };
                }
            }
        }
        for (let i = 0; i < n; i++) this.sortedIndices.add(i);
        return { arr };
    }

    *quickSortSteps(arr) {
        const stack = [[0, arr.length - 1]];
        while (stack.length) {
            const [lo, hi] = stack.pop();
            if (lo >= hi) {
                if (lo === hi) this.sortedIndices.add(lo);
                continue;
            }
            const pivot = arr[hi];
            let i = lo - 1;
            for (let j = lo; j < hi; j++) {
                yield { arr: [...arr], indices: [j, hi], action: 'compare' };
                if (arr[j] <= pivot) {
                    i++;
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    yield { arr: [...arr], indices: [i, j], action: 'swap' };
                }
            }
            [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
            yield { arr: [...arr], indices: [i + 1, hi], action: 'swap' };
            const p = i + 1;
            this.sortedIndices.add(p);
            stack.push([lo, p - 1]);
            stack.push([p + 1, hi]);
        }
        return { arr };
    }

    *heapSortSteps(arr) {
        const n = arr.length;
        
        const heapify = function* (arr, n, i) {
            let largest = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            
            if (l < n) {
                yield { arr: [...arr], indices: [l, largest], action: 'compare' };
                if (arr[l] > arr[largest]) largest = l;
            }
            if (r < n) {
                yield { arr: [...arr], indices: [r, largest], action: 'compare' };
                if (arr[r] > arr[largest]) largest = r;
            }
            
            if (largest !== i) {
                [arr[i], arr[largest]] = [arr[largest], arr[i]];
                yield { arr: [...arr], indices: [i, largest], action: 'swap' };
                yield* heapify(arr, n, largest);
            }
        };

        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            yield* heapify(arr, n, i);
        }
        
        for (let i = n - 1; i > 0; i--) {
            [arr[0], arr[i]] = [arr[i], arr[0]];
            yield { arr: [...arr], indices: [0, i], action: 'swap' };
            this.sortedIndices.add(i);
            yield* heapify(arr, i, 0);
        }
        this.sortedIndices.add(0);
        return { arr };
    }

    *shellSortSteps(arr) {
        const n = arr.length;
        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            for (let i = gap; i < n; i++) {
                let temp = arr[i];
                let j = i;
                while (j >= gap) {
                    yield { arr: [...arr], indices: [j - gap, i], action: 'compare' };
                    if (arr[j - gap] > temp) {
                        arr[j] = arr[j - gap];
                        yield { arr: [...arr], indices: [j, j - gap], action: 'swap' };
                        j -= gap;
                    } else {
                        break;
                    }
                }
                arr[j] = temp;
                yield { arr: [...arr], indices: [j], action: 'swap' };
            }
        }
        for (let i = 0; i < n; i++) this.sortedIndices.add(i);
        return { arr };
    }
}
