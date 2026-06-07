// Controller for the two visualizers
const vizA = new Visualizer('canvas-a', '#06b6d4'); // Cyan
const vizB = new Visualizer('canvas-b', '#8b5cf6'); // Violet

let masterArray = [];
let isPlaying = false;
let animationFrameId = null;
let lastStepTime = 0;
let speedMs = 20;

let complexityData = {};

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/complexity')
        .then(res => res.json())
        .then(data => {
            complexityData = data;
            updateBadges('a');
            updateBadges('b');
        });

    setupEventListeners();
    generateNewArray();
    
    // Handle resizing
    window.addEventListener('resize', () => {
        vizA.draw();
        vizB.draw();
    });
});

function setupEventListeners() {
    // Mode toggle
    document.querySelectorAll('input[name="input_mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'random') {
                document.querySelector('.random-controls').classList.remove('hidden');
                document.querySelector('.custom-controls').classList.add('hidden');
            } else {
                document.querySelector('.random-controls').classList.add('hidden');
                document.querySelector('.custom-controls').classList.remove('hidden');
            }
        });
    });

    // Array Size Input & Suggestions
    const sizeInput = document.getElementById('array-size-input');
    
    document.querySelectorAll('.btn-suggestion').forEach(btn => {
        btn.addEventListener('click', (e) => {
            sizeInput.value = e.target.getAttribute('data-val');
            generateNewArray();
        });
    });

    // Generate Array
    document.getElementById('btn-generate').addEventListener('click', () => {
        generateNewArray();
    });

    // Speed Input
    const speedInput = document.getElementById('play-speed-input');
    speedInput.addEventListener('input', (e) => {
        speedMs = parseInt(e.target.value, 10) || 0;
    });

    // Algorithms
    document.getElementById('algo-a').addEventListener('change', (e) => {
        vizA.setAlgorithm(e.target.value);
        vizA.setArray(masterArray);
        updateBadges('a');
        resetOps();
        pause();
    });
    document.getElementById('algo-b').addEventListener('change', (e) => {
        vizB.setAlgorithm(e.target.value);
        vizB.setArray(masterArray);
        updateBadges('b');
        resetOps();
        pause();
    });

    // Playback
    document.getElementById('btn-play').addEventListener('click', play);
    document.getElementById('btn-pause').addEventListener('click', pause);
    document.getElementById('btn-prev').addEventListener('click', () => {
        pause();
        stepBothBack();
    });
    document.getElementById('btn-step').addEventListener('click', () => {
        pause();
        stepBoth();
    });
}

function updateBadges(side) {
    const algo = document.getElementById(`algo-${side}`).value;
    const info = complexityData[algo] || {};
    document.getElementById(`time-${side}`).textContent = info.time || '—';
    document.getElementById(`space-${side}`).textContent = info.space || '—';
}

function resetOps() {
    document.getElementById('ops-a').textContent = '0';
    document.getElementById('ops-b').textContent = '0';
    document.getElementById('sorted-a').textContent = '0';
    document.getElementById('sorted-b').textContent = '0';
}

function generateNewArray() {
    pause();
    const mode = document.querySelector('input[name="input_mode"]:checked').value;
    if (mode === 'random') {
        const size = parseInt(document.getElementById('array-size-input').value, 10) || 50;
        masterArray = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    } else {
        const inputStr = document.getElementById('custom-input').value.trim();
        if (inputStr) {
            masterArray = inputStr.split(/\s+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
            if (masterArray.length === 0) {
                alert("Please enter valid space-separated numbers.");
                return;
            }
        } else {
            // fallback
            masterArray = [50, 20, 80, 10, 90, 30, 40, 70, 60];
        }
    }

    vizA.setAlgorithm(document.getElementById('algo-a').value);
    vizB.setAlgorithm(document.getElementById('algo-b').value);
    
    vizA.setArray(masterArray);
    vizB.setArray(masterArray);
    resetOps();
}

function play() {
    if (isPlaying) return;
    isPlaying = true;
    document.getElementById('btn-play').classList.add('hidden');
    document.getElementById('btn-pause').classList.remove('hidden');
    
    lastStepTime = performance.now();
    animationFrameId = requestAnimationFrame(animate);
}

function pause() {
    if (!isPlaying) return;
    isPlaying = false;
    document.getElementById('btn-play').classList.remove('hidden');
    document.getElementById('btn-pause').classList.add('hidden');
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

function stepBoth() {
    const steppedA = vizA.step();
    const steppedB = vizB.step();
    
    document.getElementById('ops-a').textContent = vizA.opsCount;
    document.getElementById('ops-b').textContent = vizB.opsCount;
    document.getElementById('sorted-a').textContent = vizA.sortedIndices.size;
    document.getElementById('sorted-b').textContent = vizB.sortedIndices.size;
    
    return steppedA || steppedB;
}

function stepBothBack() {
    const steppedA = vizA.stepBack();
    const steppedB = vizB.stepBack();
    
    document.getElementById('ops-a').textContent = vizA.opsCount;
    document.getElementById('ops-b').textContent = vizB.opsCount;
    document.getElementById('sorted-a').textContent = vizA.sortedIndices.size;
    document.getElementById('sorted-b').textContent = vizB.sortedIndices.size;
    
    return steppedA || steppedB;
}

function animate(currentTime) {
    if (!isPlaying) return;
    
    if (vizA.isComplete && vizB.isComplete) {
        pause();
        return;
    }
    
    let timeElapsed = currentTime - lastStepTime;
    let stepsToPerform = 0;
    
    if (speedMs < 16) {
        // High speed: perform multiple steps per frame. Avoid division by zero.
        let effectiveSpeed = Math.max(speedMs, 0.1);
        stepsToPerform = Math.floor(16 / effectiveSpeed) || 1;
        lastStepTime = currentTime;
    } else {
        // Slower speed: wait for delay
        if (timeElapsed >= speedMs) {
            stepsToPerform = 1;
            lastStepTime = currentTime;
        }
    }

    for (let i = 0; i < stepsToPerform; i++) {
        stepBoth();
        if (vizA.isComplete && vizB.isComplete) {
            pause();
            return;
        }
    }
    
    animationFrameId = requestAnimationFrame(animate);
}
