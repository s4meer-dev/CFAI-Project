// static/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('benchmark-form');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const algorithm = form.elements['algorithm'].value;
    const dataSize = parseInt(form.elements['data-size'].value, 10);
    
    const payload = {
        algorithm: algorithm,
        data_size: dataSize
    };
    
    console.log('Payload ready:', payload);
    // Future API call will go here
}
