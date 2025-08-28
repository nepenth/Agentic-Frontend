console.log('ES6 module loading test - this should appear in console');
console.log('If you see this message, ES6 modules are working');

// Test basic DOM manipulation
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in module test');
    const root = document.getElementById('root');
    if (root) {
        console.log('Root element found in module test');
        root.innerHTML = '<div style="padding: 20px; color: green; font-family: Arial;">ES6 Module Test: SUCCESS - JavaScript modules are working!</div>';
    } else {
        console.error('Root element not found in module test');
    }
});