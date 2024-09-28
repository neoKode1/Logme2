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
                personalizations: [{
                    to: [{ email: "kamasi.mahone@gmail.com" }], // Replace with recipient's email
                    subject: "Daily Log Finalized"
                }],
                from: { email: "logme2@logme2.com" }, // Replace with your verified SendGrid sender email
                content: [{
                    type: "text/html",
                    value: emailHtmlContent
                }]
            };

            try {
                console.log('Sending email data to SendGrid:', emailData);
            
                const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer YOUR_SENDGRID_API_KEY`,  // Replace with your SendGrid API Key
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(emailData)
                });
            
                // Check if the response is successful
                if (!response.ok) {
                    // Handle specific status codes
                    if (response.status === 401) {
                        throw new Error('Unauthorized: Invalid API Key or missing credentials.');
                    } else if (response.status === 403) {
                        throw new Error('Forbidden: You do not have permission to send emails.');
                    } else if (response.status === 405) {
                        throw new Error('Method Not Allowed: The server does not allow POST requests to this endpoint.');
                    }
            
                    const contentType = response.headers.get("content-type");
            
                    // Handle JSON error responses
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        const errorData = await response.json();
                        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
                    } else {
                        // Handle non-JSON error responses
                        const errorText = await response.text();
                        console.error('Non-JSON error response:', errorText);
                        throw new Error(`HTTP error! status: ${response.status}, Non-JSON response received. Please check server configuration.`);
                    }
                }
            
                // If the response is OK and contains JSON
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const result = await response.json();
                    console.log('Email sent successfully:', result);
            
                    // Display success message
                    displayMessage('Email sent successfully.', 'success');
                } else {
                    const responseText = await response.text();
                    console.log('Server response (non-JSON):', responseText);
                    displayMessage('Email sent, but server response was not in JSON format.', 'warning');
                }
            
            } catch (error) {
                // Catch and log any error that occurs
                console.error('Error sending email:', error);
                displayMessage(`Error sending email: ${error.message}`, 'error');
            }
            
        });
    }

    // Function to populate the log entries table
    function updateLogEntriesTable() {
        const logEntries = JSON.parse(localStorage.getItem('savedLogs')) || [];
        tableBody.innerHTML = '';

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
