console.log('app.js loaded');

const hotels = [
  "Chateau Elan", "Ritz Carlton", "Indigo", "Candler", "Kimpton",
  "Marriott Airport", "Starling", "Bellyard/Rooftop", "Loews",
  "Hilton Downtown", "Regis", "Thompson", "Galleria", "Westin North",
  "Avalon", "Hamilton", "Colee", "Westin North", "Westin Buckhead", "Westin Peachtree", "Courtland", "Marriot Marquis",
  "Embassy Suites", "The American", "Montgomery", "Cambria/Margaritaville"
];

const { sendEmail } = require('./emailService');

// Generates a list of number options
function generateOptions(start, end) {
  let options = '<option value="">Select</option>';
  for (let i = start; i <= end; i++) {
    options += `<option value="${i}">${i}</option>`;
  }
  return options;
}

// Generates a list of time options
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

// Centralized function to calculate total miles
function calculateTotalMiles() {
  const start = parseFloat(localStorage.getItem('odometerStart')) || 0;
  const finish = parseFloat(document.getElementById('odometerFinish').value) || 0;
  document.getElementById('totalMiles').value = Math.max(finish - start, 0);
}

// Handle form submission for log entries
document.addEventListener('DOMContentLoaded', function () {
  const logEntryForm = document.getElementById('logEntryForm');

  if (logEntryForm) {
    logEntryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const odometerStart = document.getElementById('odometerStart').value;
      localStorage.setItem('odometerStart', odometerStart);
      submitLogEntry();
    });
  }
});

// Function to submit a log entry
async function submitLogEntry(logEntry) {
  try {
    const response = await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry),
    });
    if (!response.ok) {
      throw new Error('Failed to submit log entry');
    }
    const result = await response.json();
    console.log('Log entry submitted:', result);
    return result;
  } catch (error) {
    console.error('Error submitting log entry:', error);
    throw error;
  }
}

// Function to fetch log entries
async function fetchLogEntries(page = 1, limit = 10) {
  try {
    const response = await fetch(`/api/logs?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch log entries');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching log entries:', error);
    throw error;
  }
}

// Function to update a log entry
async function updateLogEntry(fileName, updatedLogEntry) {
  try {
    const response = await fetch(`/api/logs/${fileName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedLogEntry),
    });
    if (!response.ok) {
      throw new Error('Failed to update log entry');
    }
    const result = await response.json();
    console.log('Log entry updated:', result);
    return result;
  } catch (error) {
    console.error('Error updating log entry:', error);
    throw error;
  }
}

// Function to delete a log entry
async function deleteLogEntry(fileName) {
  try {
    const response = await fetch(`/api/logs/${fileName}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete log entry');
    }
    const result = await response.json();
    console.log('Log entry deleted:', result);
    return result;
  } catch (error) {
    console.error('Error deleting log entry:', error);
    throw error;
  }
}

// Function to edit log entry
function editLogEntry(index) {
  let logEntries = JSON.parse(localStorage.getItem('savedLogs')) || [];
  const entryToEdit = logEntries[index];

  if (entryToEdit) {
    document.getElementById('hotel').value = entryToEdit.hotel;
    document.getElementById('arrivalTime').value = entryToEdit.arrivalTime;
    document.getElementById('departureTime').value = entryToEdit.departureTime;
    document.getElementById('cartsDelivered').value = entryToEdit.cartsDelivered;
    document.getElementById('cartsReceived').value = entryToEdit.cartsReceived;
    document.getElementById('stainBags').value = entryToEdit.stainBags;
    document.getElementById('waitTime').value = entryToEdit.waitTime;

    logEntries.splice(index, 1); // Remove the entry being edited
    localStorage.setItem('savedLogs', JSON.stringify(logEntries));
    updateLoggedDataTable();
    displayMessage('Log entry edited. Please update and submit.', 'info');
  }
}

// Function to display a message
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

// Populate hotel options
function populateHotelOptions() {
  const hotelSelect = document.querySelector('select[name="hotel"]');
  hotels.forEach(hotel => {
    const option = document.createElement('option');
    option.value = hotel;
    option.textContent = hotel;
    hotelSelect.appendChild(option);
  });
}

// Populate number options
function populateNumberOptions() {
  const selects = document.querySelectorAll('select[name="cartsDelivered"], select[name="cartsReceived"], select[name="stainBags"]');
  selects.forEach(select => {
    select.innerHTML = generateOptions(0, 99);
  });
}

// Populate time options
function populateTimeOptions() {
  const waitTimeSelect = document.querySelector('select[name="waitTime"]');
  waitTimeSelect.innerHTML = generateTimeOptions();
}

// Placeholder for completeAndSendDailyLog function
function completeAndSendDailyLog() {
  const logEntries = JSON.parse(localStorage.getItem('savedLogs')) || [];
  const driverInfo = {
    truckNumber: localStorage.getItem('truckNumber'),
    driverName: localStorage.getItem('driverName'),
    date: localStorage.getItem('date'),
    day: localStorage.getItem('day'),
    odometerStart: localStorage.getItem('odometerStart'),
    odometerFinish: document.getElementById('odometerFinish').value,
    totalMiles: document.getElementById('totalMiles').value,
    fuelPurchase: document.getElementById('fuelPurchase').value,
    comments: document.getElementById('comments').value
  };

  const emailContent = generateEmailContent(driverInfo, logEntries);
  
  sendEmail('recipient@example.com', 'Daily Log Report', emailContent)
    .then(() => {
      displayMessage('Daily log sent successfully', 'success');
      // Clear local storage after successful send
      localStorage.removeItem('savedLogs');
      localStorage.removeItem('truckNumber');
      localStorage.removeItem('driverName');
      localStorage.removeItem('date');
      localStorage.removeItem('day');
      localStorage.removeItem('odometerStart');
      // Redirect to confirmation page
      window.location.href = 'confirmation.html';
    })
    .catch((error) => {
      console.error('Error sending email:', error);
      displayMessage('Failed to send daily log. Please try again.', 'error');
    });
}

function generateEmailContent(driverInfo, logEntries) {
  let content = `
    <h1>Daily Log Report</h1>
    <h2>Driver Information</h2>
    <p>Truck Number: ${driverInfo.truckNumber}</p>
    <p>Driver Name: ${driverInfo.driverName}</p>
    <p>Date: ${driverInfo.date}</p>
    <p>Day: ${driverInfo.day}</p>
    <p>Odometer Start: ${driverInfo.odometerStart}</p>
    <p>Odometer Finish: ${driverInfo.odometerFinish}</p>
    <p>Total Miles: ${driverInfo.totalMiles}</p>
    <p>Fuel Purchase: ${driverInfo.fuelPurchase}</p>
    <p>Comments: ${driverInfo.comments}</p>

    <h2>Log Entries</h2>
    <table border="1">
      <tr>
        <th>Hotel</th>
        <th>Arrival Time</th>
        <th>Departure Time</th>
        <th>Carts Delivered</th>
        <th>Carts Received</th>
        <th>Stain Bags</th>
        <th>Wait Time</th>
      </tr>
      ${logEntries.map(entry => `
        <tr>
          <td>${entry.hotel}</td>
          <td>${entry.arrivalTime}</td>
          <td>${entry.departureTime}</td>
          <td>${entry.cartsDelivered}</td>
          <td>${entry.cartsReceived}</td>
          <td>${entry.stainBags || ''}</td>
          <td>${entry.waitTime || ''}</td>
        </tr>
      `).join('')}
    </table>
  `;

  return content;
}

// Initialize page on load
function initializePage() {
  console.log('Initializing page...');
  if (document.getElementById('logEntryForm')) {
    populateHotelOptions();
    populateNumberOptions();
    populateTimeOptions();
    updateLoggedDataTable();
  }

  if (document.getElementById('finalizeLogForm')) {
    const odometerFinish = document.getElementById('odometerFinish');
    odometerFinish.addEventListener('input', calculateTotalMiles);

    const completeAndSendBtn = document.getElementById('completeAndSendBtn');
    completeAndSendBtn.addEventListener('click', completeAndSendDailyLog);

    calculateTotalMiles();
    updateLoggedDataTable();
  }
}

document.addEventListener('DOMContentLoaded', initializePage);
