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
}

const visualizer = new Visualizer('sortCanvas');
