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

    draw() {
        const { canvas, ctx, array } = this;
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
            ctx.fillStyle = '#00ffcc';
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
}

const visualizer = new Visualizer('sortCanvas');

document.getElementById('viz-generate')?.addEventListener('click', () => {
    visualizer.generateArray();
});
