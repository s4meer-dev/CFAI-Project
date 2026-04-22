// static/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('benchmark-form');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

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
