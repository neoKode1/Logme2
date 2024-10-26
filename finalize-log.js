// Global variables, constants, and general functions
const hotels = [
    "Chateau Elan", "Ritz Carlton", "Indigo", "Candler", "Kimpton",
    "Marriott Airport", "Starling", "Bellyard/Rooftop", "Loews",
    "Hilton Downtown", "Regis", "Thompson", "Galleria", "Westin",
    "Avalon", "Hamilton", "Colee", "Westin North", "Westin Buckhead", "Westin Peachtree", "Courtland",
    "Embassy Suites", "The American", "Montgomery", "Cambria/Margaritaville"
];

function generateOptions(start, end) {
    if (typeof start !== 'number' || typeof end !== 'number' || start > end) {
        console.error('Invalid parameters for generateOptions');
        return '<option value="">Invalid range</option>';
    }

    let options = '<option value="">Select</option>';
    for (let i = start; i <= end; i++) {
        options += `<option value="${i}">${i}</option>`;
    }
    return options;
}

function generateTimeOptions() {
    let options = '<option value="">Select</option>';
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 30) {
            const hour = i.toString().padStart(2, '0');
            const minute = j.toString().padStart(2, '0');
            options += `<option value="${hour}:${minute}">${hour}:${minute}</option>`;
        }
    }
    return options;
}

// Specific to Finalize Daily Log functionality
function completeAndSendDailyLog() {
    try {
        const finalizeForm = document.getElementById('finalizeLogForm');
        const formData = new FormData(finalizeForm);
        const finalizeData = Object.fromEntries(formData.entries());

        // Calculate total miles
        const odometerStart = parseFloat(localStorage.getItem('odometerStart') || '0');
        const odometerFinish = parseFloat(finalizeData.odometerFinish || '0');
        const totalMiles = odometerFinish - odometerStart;

        const completeLog = {
            finalizeData: {
                odometerFinish: odometerFinish,
                totalMiles: totalMiles > 0 ? totalMiles.toFixed(1) : '0',
                fuelPurchase: finalizeData.fuelPurchase,
                comments: finalizeData.comments,
            },
            logEntries: JSON.parse(localStorage.getItem('logEntries')) || []
        };

        console.log('Attempting to send log data...', completeLog);

        // Send log data via email
        sendLogViaEmail(completeLog);

        localStorage.removeItem('logEntries');
        finalizeForm.reset();
    } catch (error) {
        console.error('Error processing log data:', error);
        displayMessage('Failed to process log data. Please try again.', 'error');
    }
}

async function sendLogViaEmail(completeLog) {
    const emailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Log Entry</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .email-container {
                max-width: 600px;
                margin: auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
            }
            .header img {
                max-width: 150px;
            }
            .content {
                text-align: left;
            }
            .content h1 {
                color: #4f46e5;
                font-size: 24px;
            }
            .content p {
                margin: 10px 0;
            }
            .table-container {
                margin-top: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }
            table th, table td {
                padding: 8px 12px;
                border: 1px solid #ddd;
                text-align: left;
            }
            table th {
                background-color: #4f46e5;
                color: white;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <img src="https://res.cloudinary.com/dg0rdurdy/image/upload/v1724998779/email_wallpaper_k0robs.webp<!-- Replace with the full URL to your logo -->
                <H1><strong>UHS</strong></H1>
                <h1>Log Entry</h1>
            </div>
            <div class="content">
                <p><strong>Odometer Finish:</strong> ${completeLog.finalizeData.odometerFinish}</p>
                <p><strong>Total Miles:</strong> ${completeLog.finalizeData.totalMiles}</p>
                <p><strong>Fuel Purchase:</strong> ${completeLog.finalizeData.fuelPurchase}</p>
                <p><strong>Comments:</strong> ${completeLog.finalizeData.comments}</p>

                <div class="table-container">
                   <h2>Log Entries</h2>
                    <table>
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
                            ${completeLog.logEntries.map(entry => `
                                <tr>
                                    <td>${entry.hotel || 'N/A'}</td>
                                    <td>${entry.arrivalTime || 'N/A'}</td>
                                    <td>${entry.departureTime || 'N/A'}</td>
                                    <td>${entry.cartsDelivered || 'N/A'}</td>
                                    <td>${entry.cartsReceived || 'N/A'}</td>
                                    <td>${entry.stainBags || 'N/A'}</td>
                                    <td>${entry.waitTime || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const response = await fetch('http://localhost:3000/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: "Kamasi.mahone@gmail.com",
                subject: `Driver Log - ${completeLog.finalizeData.odometerFinish}`,
                html: emailContent, // Using 'html' field instead of 'text' to send HTML content
            }),
        });

        if (response.ok) {
            console.log('Email sent successfully');
            displayMessage('Log sent successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'confirmation.html';
            }, 2000);
        } else {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
    } catch (emailError) {
        console.error('Error sending email:', emailError);
        saveLogLocally(completeLog);
    }
}

function saveLogLocally(completeLog) {
    const savedLogs = JSON.parse(localStorage.getItem('savedLogs')) || [];
    savedLogs.push({
        timestamp: new Date().toISOString(),
        log: completeLog
    });
    localStorage.setItem('savedLogs', JSON.stringify(savedLogs));
    console.log('Log saved locally');
    displayMessage('Unable to send email. Log saved locally.', 'warning');
}

// Additional functions and event listeners for the Finalize Daily Log page
function calculateTotalMiles() {
    const odometerStart = parseFloat(localStorage.getItem('odometerStart')) || 0;
    const odometerFinish = parseFloat(document.getElementById('odometerFinish').value) || 0;
    const totalMiles = Math.max(odometerFinish - odometerStart, 0);
    document.getElementById('totalMiles').value = totalMiles.toFixed(1);
}

function populateHotelOptions() {
    const hotelSelect = document.querySelector('select[name="hotel"]');
    if (hotelSelect) {
        hotels.forEach(hotel => {
            const option = document.createElement('option');
            option.value = hotel;
            option.textContent = hotel;
            hotelSelect.appendChild(option);
        });
    } else {
        console.error('Hotel select element not found.');
    }
}

function populateNumberOptions() {
    const selects = document.querySelectorAll('select[name="cartsDelivered"], select[name="cartsReceived"], select[name="stainBags"]');
    const numberOptions = generateOptions(0, 99);
    selects.forEach(select => {
        select.innerHTML = numberOptions;
    });
}

function populateTimeOptions() {
    const waitTimeSelect = document.querySelector('select[name="waitTime"]');
    if (waitTimeSelect) {
        waitTimeSelect.innerHTML = generateTimeOptions();
    } else {
        console.error('Wait time select element not found.');
    }
}

function initializePage() {
    console.log('Initializing page...');
    if (document.getElementById('logEntryForm')) {
        console.log('Log entry form found, populating options');
        populateHotelOptions();
        populateNumberOptions();
        populateTimeOptions();
        updateLoggedDataTable();

        document.getElementById('submitLogEntryBtn').addEventListener('click', submitLogEntry);
        document.getElementById('saveAndContinueBtn').addEventListener('click', function () {
            submitLogEntry();
            window.location.href = 'Finalize Daily Log.html';
        });
    }

    if (document.getElementById('finalizeLogForm')) {
        const odometerFinishInput = document.getElementById('odometerFinish');
        if (odometerFinishInput) {
            odometerFinishInput.addEventListener('input', calculateTotalMiles);
        }
        document.getElementById('finalizeBtn').addEventListener('click', completeAndSendDailyLog);
    }
}

document.addEventListener('DOMContentLoaded', initializePage);

document.getElementById('logEntryForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Generate the next log ID
    const logId = getNextLogId();

    // Collect form data and include the log ID
    const formData = new FormData(event.target);
    const logEntry = Object.fromEntries(formData.entries());
    logEntry.logId = logId;

    // Save the log entry (e.g., to local storage or send to server)
    saveLogEntry(logEntry);

    // Optionally, clear the form or navigate to a different page
    event.target.reset();
});

// Add this function
function displayMessage(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
