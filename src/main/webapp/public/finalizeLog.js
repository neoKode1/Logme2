// Log when the script loads
console.log('Finalize Log script loaded');

// Add this to your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    console.log('Current logEntries:', localStorage.getItem('logEntries'));
    loadSavedLogEntries();
});

// Function to load and display saved log entries
function loadSavedLogEntries() {
    console.log('Loading saved entries...');
    const savedEntries = JSON.parse(localStorage.getItem('logEntries') || '[]');
    console.log('Saved entries:', savedEntries);
    
    const tableBody = document.querySelector('#logEntriesTable tbody');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }
    
    tableBody.innerHTML = ''; // Clear existing rows
    
    savedEntries.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${entry.hotel || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${entry.arrivalTime || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${entry.departureTime || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${entry.cartsDelivered || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${entry.cartsReceived || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${entry.stainBags || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${entry.waitTime || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="editEntry(${index})" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                <button onclick="deleteEntry(${index})" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to delete an entry
function deleteEntry(index) {
    const savedEntries = JSON.parse(localStorage.getItem('logEntries') || '[]');
    savedEntries.splice(index, 1);
    localStorage.setItem('logEntries', JSON.stringify(savedEntries));
    loadSavedLogEntries(); // Reload the table
}

// Function to edit an entry
function editEntry(index) {
    window.location.href = `DriverDeliveryLogForm.html?edit=${index}`;
}

// Function to send email
function sendEmail(formData) {
    const backendUrl = window.location.hostname === 'logme2.com'
        ? 'https://api.logme2.com/api/send-email'
        : 'http://localhost:3000/api/send-email';

    fetch(backendUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Clear the logs after successful send
        localStorage.removeItem('logEntries');
        window.location.href = 'confirmation.html';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to send email. Please try again.');
    });
}
