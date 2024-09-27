// Function to calculate total miles
function calculateTotalMiles() {
    const odometerStart = parseFloat(localStorage.getItem('odometerStart')) || 0;
    const odometerFinish = parseFloat(document.getElementById('odometerFinish').value) || 0;
    document.getElementById('totalMiles').value = Math.max(odometerFinish - odometerStart, 0);
}

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    const finalizeForm = document.getElementById('finalizeForm');
    const finalizeBtn = document.getElementById('finalizeBtn');
    const odometerFinishInput = document.getElementById('odometerFinish');
    const tableBody = document.querySelector('#logEntriesTable tbody'); // Get the table body

    // Function to handle form submission and send the daily log email
    if (finalizeForm && finalizeBtn) {
        finalizeBtn.addEventListener('click', async function (e) {
            console.log('Complete and Send button clicked');
            e.preventDefault();

            const odometerFinish = parseFloat(document.getElementById('odometerFinish').value) || 0;
            const totalMiles = parseFloat(document.getElementById('totalMiles').value) || 0;
            const fuelPurchase = document.getElementById('fuelPurchase').value || 'N/A';
            const comments = document.getElementById('comments').value || 'N/A';

            let logEntries = JSON.parse(localStorage.getItem('savedLogs')) || [];

            if (logEntries.length === 0) {
                displayMessage('No log entries found.', 'error');
                return;
            }

            let tableRows = '';
            logEntries.forEach(entry => {
                tableRows += `
                    <tr>
                        <td>${entry.hotel || 'N/A'}</td>
                        <td>${entry.arrivalTime || 'N/A'}</td>
                        <td>${entry.departureTime || 'N/A'}</td>
                        <td>${entry.cartsDelivered || 'N/A'}</td>
                        <td>${entry.cartsReceived || 'N/A'}</td>
                        <td>${entry.stainBags || 'N/A'}</td>
                        <td>${entry.calculatedWaitTime || 'N/A'}</td>
                    </tr>
                `;
            });

            const emailHtmlContent = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="background-color: #4CAF50; color: white; padding: 10px;">Daily Log Finalized</h2>
                    <p>Odometer Finish: ${odometerFinish}</p>
                    <p>Total Miles: ${totalMiles}</p>
                    <p>Fuel Purchase: ${fuelPurchase}</p>
                    <p>Comments: ${comments}</p>
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

            const emailData = {
                to: "kamasi.mahone@gmail.com", // Set recipient
                subject: "Daily Log Finalized",
                html: emailHtmlContent
            };

            console.log(emailData);

            try {
                const response = await fetch('https://your-custom-domain.com/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(emailData)
                });
                

                if (response.ok) {
                    displayMessage('Email sent successfully.', 'success');
                    localStorage.clear(); // Clear all local storage data
                    finalizeForm.reset(); // Reset the form
                    window.location.href = '/confirmation.html'; // Redirect to confirmation page
                } else {
                    const result = await response.json();
                    displayMessage(`Failed to send email: ${result.message}`, 'error');
                }
            } catch (error) {
                displayMessage(`Error sending email: ${error.message}`, 'error');
            }
        });
    }

    // Function to populate the log entries table
    function updateLogEntriesTable() {
        const logEntries = JSON.parse(localStorage.getItem('savedLogs')) || [];
        tableBody.innerHTML = ''; // Clear the table

        if (logEntries.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7">No entries found.</td></tr>`;
        } else {
            logEntries.forEach(entry => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${entry.hotel || 'N/A'}</td>
                    <td>${entry.arrivalTime || 'N/A'}</td>
                    <td>${entry.departureTime || 'N/A'}</td>
                    <td>${entry.cartsDelivered || 'N/A'}</td>
                    <td>${entry.cartsReceived || 'N/A'}</td>
                    <td>${entry.stainBags || 'N/A'}</td>
                    <td>${entry.calculatedWaitTime || 'N/A'}</td>
                `;
            });
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
