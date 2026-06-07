// static/js/visualizer.js

class Visualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.array = [];
        this.generator = null;
        this.intervalId = null;
        this.speed = 50;
        this.sortedIndices = new Set();
    }

    draw(highlights = {}) {
        const { canvas, ctx, array, sortedIndices } = this;
        if (!ctx) return;

        // Sync canvas pixel width to its rendered CSS width
        if (canvas.offsetWidth > 0 && canvas.width !== canvas.offsetWidth) {
            canvas.width = canvas.offsetWidth;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (array.length === 0) return;

        const barWidth = canvas.width / array.length;
        const maxVal = Math.max(...array);

        array.forEach((val, i) => {
            const barHeight = (val / maxVal) * (canvas.height - 10);

            // Priority: swap > compare > sorted > default
            let color = '#00ffcc';                        // default teal
            if (sortedIndices.has(i)) color = '#22c55e'; // green  — sorted
            if (highlights[i] === 'compare') color = '#facc15'; // yellow
            if (highlights[i] === 'swap')    color = '#ef4444'; // red

            ctx.fillStyle = color;
            ctx.fillRect(
                i * barWidth + 1,
                canvas.height - barHeight,
                barWidth - 2,
                barHeight
            );
        });
    }

    generateArray(size = 60) {
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = null;
        this.generator = null;
        this.sortedIndices = new Set();
        if (this.canvas.offsetWidth > 0) this.canvas.width = this.canvas.offsetWidth;
        this.array = Array.from(
            { length: size },
            () => Math.floor(Math.random() * (this.canvas.height - 20)) + 10
        );
        this.draw();
    }

    *bubbleSortSteps(arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                yield { indices: [j, j + 1], action: 'compare' };
                if (arr[j] > arr[j + 1]) {
                    yield { indices: [j, j + 1], action: 'swap' };
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                }
            }
            this.sortedIndices.add(n - 1 - i);
        }
        this.sortedIndices.add(0);
    }

    *selectionSortSteps(arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                yield { indices: [minIdx, j], action: 'compare' };
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            if (minIdx !== i) {
                yield { indices: [i, minIdx], action: 'swap' };
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            }
            this.sortedIndices.add(i);
        }
        this.sortedIndices.add(n - 1);
    }

    *insertionSortSteps(arr) {
        const n = arr.length;
        this.sortedIndices.add(0);
        for (let i = 1; i < n; i++) {
            let j = i;
            while (j > 0) {
                yield { indices: [j - 1, j], action: 'compare' };
                if (arr[j] < arr[j - 1]) {
                    yield { indices: [j - 1, j], action: 'swap' };
                    [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
                    j--;
                } else {
                    break;
                }
            }
            this.sortedIndices.add(i);
        }
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
                    yield { indices: [lo + i, mid + j], action: 'compare' };
                    if (left[i] <= right[j]) {
                        arr[k++] = left[i++];
                    } else {
                        arr[k++] = right[j++];
                    }
                    yield { indices: [k - 1], action: 'swap' };
                }
                while (i < left.length) { arr[k++] = left[i++]; }
                while (j < right.length) { arr[k++] = right[j++]; }
            }
        }
        for (let i = 0; i < n; i++) this.sortedIndices.add(i);
    }

    *quickSortSteps(arr) {
        const stack = [[0, arr.length - 1]];
        while (stack.length) {
            const [lo, hi] = stack.pop();
            if (lo >= hi) {
                if (lo === hi) this.sortedIndices.add(lo);
                continue;
            }
            // Lomuto partition
            const pivot = arr[hi];
            let i = lo - 1;
            for (let j = lo; j < hi; j++) {
                yield { indices: [j, hi], action: 'compare' };
                if (arr[j] <= pivot) {
                    i++;
                    yield { indices: [i, j], action: 'swap' };
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
            }
            yield { indices: [i + 1, hi], action: 'swap' };
            [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
            const p = i + 1;
            this.sortedIndices.add(p);
            stack.push([lo, p - 1]);
            stack.push([p + 1, hi]);
        }
    }
}

const visualizer = new Visualizer('sortCanvas');

document.getElementById('viz-generate')?.addEventListener('click', () => {
    visualizer.generateArray();
});
