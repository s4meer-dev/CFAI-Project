// static/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('benchmark-form');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

function handleFormSubmit(event) {
    event.preventDefault();
    console.log('Form submitted. Ready to dispatch API call.');
}
