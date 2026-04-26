// static/js/main.js
let benchmarkChart;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('benchmark-form');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    const clearBtn = document.getElementById('clear-chart');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            benchmarkChart.data.labels = [];
            benchmarkChart.data.datasets[0].data = [];
            benchmarkChart.update();
            const tbody = document.querySelector('#history-table tbody');
            if (tbody) tbody.innerHTML = '';
        });
    }

    const exportBtn = document.getElementById('export-csv');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTableToCSV);
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

function addHistoryRow(data) {
    const tbody = document.querySelector('#history-table tbody');
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--border-color)';
    
    const memBytes = data.memory_usage_bytes || 0;
    
    row.innerHTML = `
        <td style="padding: 0.5rem;">${data.algorithm.replace('_', ' ')}</td>
        <td style="padding: 0.5rem;">${data.size} (${data.data_type})</td>
        <td style="padding: 0.5rem;">${data.execution_time_ms.toFixed(4)}</td>
        <td style="padding: 0.5rem;">${memBytes.toFixed(2)}</td>
    `;
    
    tbody.prepend(row);
}

function exportTableToCSV() {
    const table = document.getElementById('history-table');
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    for (let i = 0; i < rows.length; i++) {
        let row = [], cols = rows[i].querySelectorAll('td, th');
        
        for (let j = 0; j < cols.length; j++) {
            row.push('"' + cols[j].innerText + '"');
        }
        csv.push(row.join(','));
    }
    
    downloadCSV(csv.join('\\n'), 'benchmark_history.csv');
}

function downloadCSV(csv, filename) {
    let csvFile;
    let downloadLink;

    csvFile = new Blob([csv], {type: "text/csv"});
    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const algorithm = form.elements['algorithm'].value;
    const dataSize = parseInt(form.elements['data-size'].value, 10);
    const dataType = form.elements['data-type'].value;
    const iterations = parseInt(form.elements['iterations'].value, 10);
    const btn = form.querySelector('button[type="submit"]');
    
    const payload = {
        algorithm: algorithm,
        data_size: dataSize,
        data_type: dataType,
        iterations: iterations
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
            const label = `${algorithm.replace('_', ' ')} (${dataType.charAt(0)}, n=${data.size})`;
            updateChart(label, data.execution_time_ms);
            addHistoryRow(data);
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
