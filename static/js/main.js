// static/js/main.js
let benchmarkChart;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('benchmark-form');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    initChart();
});

function initChart() {
    const ctx = document.getElementById('benchmarkChart').getContext('2d');
    benchmarkChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Execution Time (ms)',
                data: [],
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (ms)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Algorithm Config'
                    }
                }
            }
        }
    });
}

function updateChart(label, time) {
    benchmarkChart.data.labels.push(label);
    benchmarkChart.data.datasets[0].data.push(time);
    benchmarkChart.update();
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const algorithm = form.elements['algorithm'].value;
    const dataSize = parseInt(form.elements['data-size'].value, 10);
    const btn = form.querySelector('button[type="submit"]');
    
    const payload = {
        algorithm: algorithm,
        data_size: dataSize
    };
    
    btn.disabled = true;
    btn.textContent = 'Running...';
    
    try {
        const response = await fetch('/api/benchmark', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            const label = `${algorithm.replace('_', ' ')} (n=${data.size})`;
            updateChart(label, data.execution_time_ms);
        } else {
            alert('Failed to run benchmark');
        }
    } catch (error) {
        console.error('Error fetching benchmark:', error);
        alert('An error occurred during benchmark execution.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Run Benchmark';
    }
}
