document.addEventListener('DOMContentLoaded', function () {
    const finalizeForm = document.getElementById('finalizeForm');
    const finalizeBtn = document.getElementById('finalizeBtn');
    const odometerFinishInput = document.getElementById('odometerFinish');
    const tableBody = document.querySelector('#logEntriesTable tbody');

    // Function to handle form submission and send the daily log email
    if (finalizeForm && finalizeBtn) {
        finalizeBtn.addEventListener('click', async function (e) {
            console.log('Complete and Send button clicked');
            e.preventDefault();

            try {
                const logEntries = await fetchLogEntries();

                if (logEntries.length === 0) {
                    displayMessage('No log entries found.', 'error');
                    return;
                }

                const emailHtmlContent = generateEmailContent({
                    odometerFinish: parseFloat(document.getElementById('odometerFinish').value) || 0,
                    totalMiles: parseFloat(document.getElementById('totalMiles').value) || 0,
                    fuelPurchase: document.getElementById('fuelPurchase').value || 'N/A',
                    comments: document.getElementById('comments').value || 'N/A'
                }, logEntries);

                const emailData = {
                    to: "recipient@example.com", // Set recipient
                    subject: "Daily Log Finalized",
                    html: emailHtmlContent
                };

                const response = await fetch('/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(emailData)
                });

                if (!response.ok) {
                    throw new Error('Failed to send email');
                }

                console.log('Email sent successfully');
                displayMessage('Email sent successfully.', 'success');
                // Clear form and redirect
                finalizeForm.reset();
                window.location.href = 'confirmation.html';
            } catch (error) {
                console.error('Error finalizing log:', error);
                displayMessage(`Error finalizing log: ${error.message}`, 'error');
            }
        });
    }

    // Function to fetch log entries from Google Cloud Storage
    async function fetchLogEntries() {
        try {
            // First try to get logs from Cloud Storage
            const token = localStorage.getItem('googleToken');
            const response = await fetch('/api/logs', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch from Cloud Storage');
            }

            const data = await response.json();
            return data.logs;
        } catch (error) {
            console.error('Error fetching from Cloud Storage:', error);
            // Fallback to localStorage
            console.log('Falling back to localStorage');
            return JSON.parse(localStorage.getItem('savedLogs')) || [];
        }
    }

    // Function to populate the log entries table
    async function updateLogEntriesTable() {
        try {
            const logEntries = await fetchLogEntries();
            const tableBody = document.querySelector('#logEntriesTable tbody');
            
            if (!tableBody) {
                console.error('Table body not found');
                return;
            }

            tableBody.innerHTML = '';

            if (!logEntries || logEntries.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No entries found.</td></tr>';
                return;
            }

            logEntries.forEach(entry => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td class="px-6 py-4">${entry.hotel || 'N/A'}</td>
                    <td class="px-6 py-4">${entry.arrivalTime || 'N/A'}</td>
                    <td class="px-6 py-4">${entry.departureTime || 'N/A'}</td>
                    <td class="px-6 py-4">${entry.cartsDelivered || 'N/A'}</td>
                    <td class="px-6 py-4">${entry.cartsReceived || 'N/A'}</td>
                    <td class="px-6 py-4">${entry.stainBags || 'N/A'}</td>
                    <td class="px-6 py-4">${entry.calculatedWaitTime || 'N/A'}</td>
                `;
            });
        } catch (error) {
            console.error('Error updating log entries table:', error);
            displayMessage('Failed to load log entries', 'error');
        }
    }

    // Calculate total miles when odometerFinish value changes
    if (odometerFinishInput) {
        odometerFinishInput.addEventListener('input', calculateTotalMiles);
    }

    // Calculate total miles on page load if odometerFinish has a value
    calculateTotalMiles();

    // Populate log entries table on page load
    updateLogEntriesTable();
});

// Function to calculate total miles
function calculateTotalMiles() {
    const odometerStart = parseFloat(localStorage.getItem('odometerStart')) || 0;
    const odometerFinish = parseFloat(document.getElementById('odometerFinish').value) || 0;
    document.getElementById('totalMiles').value = Math.max(odometerFinish - odometerStart, 0);
}

// Function to display messages
function displayMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type} fixed top-4 right-4 p-4 rounded shadow-lg`;
    messageDiv.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    messageDiv.style.color = 'white';
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Function to generate email content
function generateEmailContent(finalData, logEntries) {
    let tableRows = logEntries.map(entry => `
        <tr>
            <td>${entry.hotel || 'N/A'}</td>
            <td>${entry.arrivalTime || 'N/A'}</td>
            <td>${entry.departureTime || 'N/A'}</td>
            <td>${entry.cartsDelivered || 'N/A'}</td>
            <td>${entry.cartsReceived || 'N/A'}</td>
            <td>${entry.stainBags || 'N/A'}</td>
            <td>${entry.calculatedWaitTime || 'N/A'}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="background-color: #4CAF50; color: white; padding: 10px;">Daily Log Finalized</h2>
            <p>Odometer Finish: ${finalData.odometerFinish}</p>
            <p>Total Miles: ${finalData.totalMiles}</p>
            <p>Fuel Purchase: ${finalData.fuelPurchase}</p>
            <p>Comments: ${finalData.comments}</p>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th>Hotel</th>
                        <th>Arrival Time</th>
                        <th>Departure Time</th>
                        <th>Carts Delivered</th>
                        <th>Carts Received</th>
                        <th>Stain Bags</th>
                        <th>Wait Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}
