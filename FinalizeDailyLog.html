// Log when the script loads
console.log('Finalize Daily Log script loaded');

document.addEventListener('DOMContentLoaded', function() {
    const finalizeForm = document.getElementById('finalizeForm');
    const finalizeBtn = document.getElementById('finalizeBtn');

    // Function to send email
    function sendEmail(logData) {
        console.log('Sending email with data:', logData);

        return fetch('https://44.208.163.169/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    }

    // Function to get all log entries
    function getLogEntries() {
        const entries = JSON.parse(localStorage.getItem('logEntries') || '[]');
        console.log('Retrieved log entries:', entries);
        return entries;
    }

    // Function to clear log entries
    function clearLogEntries() {
        localStorage.removeItem('logEntries');
        console.log('Log entries cleared from localStorage');
    }

    // Event listener for the finalize form submission
    finalizeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Finalize form submitted');

        const odometerFinish = document.getElementById('odometerFinish').value;
        const totalMiles = document.getElementById('totalMiles').value;
        const fuelPurchase = document.getElementById('fuelPurchase').value;
        const comments = document.getElementById('comments').value;

        const finalData = {
            odometerFinish,
            totalMiles,
            fuelPurchase,
            comments,
            logEntries: getLogEntries()
        };

        finalizeBtn.disabled = true;
        finalizeBtn.textContent = 'Sending...';

        sendEmail(finalData)
            .then(data => {
                console.log('Email sent successfully:', data);
                clearLogEntries();
                console.log('Redirecting to confirmation page...');
                window.location.href = 'confirmation.html';
            })
            .catch(error => {
                console.error('Error sending email:', error);
                alert('An error occurred while sending the email. Please try again.');
                finalizeBtn.disabled = false;
                finalizeBtn.textContent = 'Complete and Send';
            });
    });

    // Calculate total miles when odometer finish is entered
    document.getElementById('odometerFinish').addEventListener('input', function() {
        const odometerStart = localStorage.getItem('odometerStart');
        const odometerFinish = this.value;
        if (odometerStart && odometerFinish) {
            const totalMiles = odometerFinish - odometerStart;
            document.getElementById('totalMiles').value = totalMiles;
        }
    });

    // Populate the table with saved log entries
    function populateLogEntriesTable() {
        const logEntries = getLogEntries();
        const tableBody = document.querySelector('#logEntriesTable tbody');
        tableBody.innerHTML = '';

        logEntries.forEach((entry, index) => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${entry.hotel}</td>
                <td class="px-6 py-4 whitespace-nowrap">${entry.arrivalTime}</td>
                <td class="px-6 py-4 whitespace-nowrap">${entry.departureTime}</td>
                <td class="px-6 py-4 whitespace-nowrap">${entry.cartsDelivered}</td>
                <td class="px-6 py-4 whitespace-nowrap">${entry.cartsReceived}</td>
                <td class="px-6 py-4 whitespace-nowrap">${entry.stainBags}</td>
                <td class="px-6 py-4 whitespace-nowrap">${entry.waitTime}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="editEntry(${index})" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onclick="deleteEntry(${index})" class="ml-2 text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;
        });
    }

    // Call this function when the page loads
    populateLogEntriesTable();
});

// Functions for editing and deleting entries (to be implemented)
function editEntry(index) {
    console.log('Edit entry at index:', index);
    // Implement edit functionality
}

function deleteEntry(index) {
    console.log('Delete entry at index:', index);
    // Implement delete functionality
}