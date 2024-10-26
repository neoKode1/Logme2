// Function to calculate total miles
function calculateTotalMiles() {
    const odometerStart = parseFloat(localStorage.getItem('odometerStart')) || 0;
    const odometerFinish = parseFloat(document.getElementById('odometerFinish').value) || 0;
    document.getElementById('totalMiles').value = Math.max(odometerFinish - odometerStart, 0);
}

// Event listener for when the DOM is fully loaded


// Function to display messages
function displayMessage(message, type) {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = type;
        messageElement.style.display = 'block';
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
}
