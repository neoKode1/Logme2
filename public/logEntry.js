document.addEventListener('DOMContentLoaded', function () {
    const finalizeForm = document.getElementById('finalizeForm');
  
    // Function to calculate total miles
    function calculateTotalMiles() {
        const odometerStart = parseFloat(localStorage.getItem('odometerStart')) || 0;
        const odometerFinish = parseFloat(document.getElementById('odometerFinish').value) || 0;
        const totalMiles = Math.max(odometerFinish - odometerStart, 0);
        document.getElementById('totalMiles').value = totalMiles;
    }
  
    // Event listener for odometer finish input to calculate miles
    if (finalizeForm) {
        const odometerFinish = document.getElementById('odometerFinish');
        odometerFinish.addEventListener('input', calculateTotalMiles);
  
        // Handle form submission
        finalizeForm.addEventListener('submit', async function (e) {
            e.preventDefault();
  
            const odometerFinishValue = parseFloat(odometerFinish.value);
            const totalMiles = parseFloat(document.getElementById('totalMiles').value);
            const fuelPurchase = document.getElementById('fuelPurchase').value;
            const comments = document.getElementById('comments').value;
  
            let logEntries = JSON.parse(localStorage.getItem('savedLogs')) || [];
            let tableRows = '';
  
            logEntries.forEach(entry => {
                tableRows += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${entry.hotel || 'N/A'}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${entry.arrivalTime || 'N/A'}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${entry.departureTime || 'N/A'}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${entry.cartsDelivered || 'N/A'}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${entry.cartsReceived || 'N/A'}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${entry.stainBags || 'N/A'}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${entry.calculatedWaitTime || 'N/A'}</td>
                    </tr>
                `;
            });
  
            const emailHtmlContent = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="background-color: #4CAF50; color: white; padding: 10px;">Daily Log Finalized</h2>
                    <p>Odometer Finish: ${odometerFinishValue}</p>
                    <p>Total Miles: ${totalMiles}</p>
                    <p>Fuel Purchase: ${fuelPurchase}</p>
                    <p>Comments: ${comments}</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Hotel</th>
                                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Arrival Time</th>
                                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Departure Time</th>
                                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Carts Delivered</th>
                                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Carts Received</th>
                                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Stain Bags</th>
                                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Wait Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            `;
  
            const recipient = "kamasi.mahone@gmail.com";
  
            const emailData = {
                to: recipient,
                subject: "Daily Log Finalized",
                html: emailHtmlContent  // Send the HTML email content
            };
  
            try {
                const response = await fetch('http://localhost:3000/send-email', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(emailData)
                });
  
                if (response.ok) {
                    alert('Email sent successfully.'); // Display a simple alert
                    localStorage.clear();  // Clear all local storage data
                    finalizeForm.reset();   // Reset the form
                    window.location.href = '/index.html';  // Ensure this path is correct for redirection
                } else {
                    const result = await response.json();
                    alert(`Failed to send email: ${result.message}`); // Update this based on backend response
                }
            } catch (error) {
                alert(`Error sending email: ${error.message}`);
            }
        });
    }
  
    // Populate the log entries table
    function updateLogEntriesTable() {
        const tableBody = document.querySelector('#logEntriesTable tbody');
        const logEntries = JSON.parse(localStorage.getItem('savedLogs')) || [];
        tableBody.innerHTML = ''; // Clear the table first
  
        logEntries.forEach((entry, index) => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${entry.hotel || 'N/A'}</td>
                <td>${entry.arrivalTime || 'N/A'}</td>
                <td>${entry.departureTime || 'N/A'}</td>
                <td>${entry.cartsDelivered || 'N/A'}</td>
                <td>${entry.cartsReceived || 'N/A'}</td>
                <td>${entry.stainBags || 'N/A'}</td>
                <td>${entry.calculatedWaitTime || 'N/A'}</td>
                <td>
                    <button class="edit-btn text-indigo-600 hover:text-indigo-900" onclick="editLogEntry(${index})">Edit</button>
                    <button class="delete-btn text-white bg-red-600 hover:bg-red-800 px-2 py-1 rounded ml-2" onclick="deleteLogEntry(${index})">Delete</button>
                </td>
            `;
        });
    }
  
    // Edit log entry function
    window.editLogEntry = function (index) {
        const logEntries = JSON.parse(localStorage.getItem('savedLogs')) || [];
        const entryToEdit = logEntries[index];
  
        document.getElementById('hotel').value = entryToEdit.hotel || '';
        document.getElementById('arrivalTime').value = entryToEdit.arrivalTime || '';
        document.getElementById('departureTime').value = entryToEdit.departureTime || '';
        document.getElementById('cartsDelivered').value = entryToEdit.cartsDelivered || '';
        document.getElementById('cartsReceived').value = entryToEdit.cartsReceived || '';
        document.getElementById('stainBags').value = entryToEdit.stainBags || '';
  
        logEntries.splice(index, 1); // Remove the entry being edited
        localStorage.setItem('savedLogs', JSON.stringify(logEntries));
        updateLogEntriesTable();
    };
  
    // Delete log entry function
    window.deleteLogEntry = function (index) {
        const logEntries = JSON.parse(localStorage.getItem('savedLogs')) || [];
        logEntries.splice(index, 1);
        localStorage.setItem('savedLogs', JSON.stringify(logEntries));
        updateLogEntriesTable();
    };
  
    // Initialize the log entries table on page load
    updateLogEntriesTable();
  });
  