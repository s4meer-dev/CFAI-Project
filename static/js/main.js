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
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
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

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const algorithm = form.elements['algorithm'].value;
    const dataSize = parseInt(form.elements['data-size'].value, 10);
    
    const payload = {
        algorithm: algorithm,
        data_size: dataSize
    };
    
    try {
        const response = await fetch('/api/benchmark', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log('Result:', data);
    } catch (error) {
        console.error('Error fetching benchmark:', error);
    }
}
