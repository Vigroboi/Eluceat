document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Here you can add the code to send the form data to your server
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Message:', message);
    
    alert('Thank you for contacting us!');
});
