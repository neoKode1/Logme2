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

            try {
                console.log('Sending email with data:', emailData);

                const response = await sendEmail(emailData.to, emailData.subject, emailData.html);

                console.log('Email sent successfully:', response);
                displayMessage('Email sent successfully.', 'success');
                localStorage.clear();
                finalizeForm.reset();
                window.location.href = 'confirmation.html';
            } catch (error) {
                console.error('Error sending email:', error);
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
