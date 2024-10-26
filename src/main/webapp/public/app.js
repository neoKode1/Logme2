console.log('app.js loaded');

const hotels = [
  "Chateau Elan", "Ritz Carlton", "Indigo", "Candler", "Kimpton",
  "Marriott Airport", "Starling", "Bellyard/Rooftop", "Loews",
  "Hilton Downtown", "Regis", "Thompson", "Galleria", "Westin North",
  "Avalon", "Hamilton", "Colee", "Westin North", "Westin Buckhead", "Westin Peachtree", "Courtland", "Marriot Marquis",
  "Embassy Suites", "The American", "Montgomery", "Cambria/Margaritaville"
];

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

// Submits log entry and updates local storage
function submitLogEntry() {
  const logEntryForm = document.getElementById('logEntryForm');
  if (logEntryForm) {
    const formData = new FormData(logEntryForm);
    const logEntry = Object.fromEntries(formData.entries());

    // Save log entry to local storage
    let logEntries = JSON.parse(localStorage.getItem('logEntries') || '[]');
    logEntry.id = Date.now(); // Unique ID for each log entry
    logEntries.push(logEntry);
    localStorage.setItem('logEntries', JSON.stringify(logEntries));

    updateLoggedDataTable();
    logEntryForm.reset();
    displayMessage('Log entry submitted successfully', 'success');
  }
}

// Updates the logged data table
function updateLoggedDataTable() {
  const tableBody = document.querySelector('#loggedDataTable tbody');
  const logEntries = JSON.parse(localStorage.getItem('logEntries') || '[]');

  tableBody.innerHTML = '';
  logEntries.forEach((entry, index) => {
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>${entry.hotel}</td>
      <td>${entry.arrivalTime}</td>
      <td>${entry.departureTime}</td>
      <td>${entry.cartsDelivered}</td>
      <td>${entry.cartsReceived}</td>
      <td>${entry.stainBags || ''}</td>
      <td>${entry.waitTime || ''}</td>
      <td><button class="edit-btn" onclick="editLogEntry(${index})">Edit</button></td>
    `;
  });
}

// Function to edit log entry
function editLogEntry(index) {
  let logEntries = JSON.parse(localStorage.getItem('logEntries') || '[]');
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
    localStorage.setItem('logEntries', JSON.stringify(logEntries));
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
  // Logic for sending the finalized log via email or WebSocket
  console.log('Complete and Send log');
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

// Call the initialize function when the page is loaded
document.addEventListener('DOMContentLoaded', initializePage);

// When saving a log entry
function saveLogEntry(entry) {
    const savedEntries = JSON.parse(localStorage.getItem('logEntries') || '[]');
    savedEntries.push(entry);
    localStorage.setItem('logEntries', JSON.stringify(savedEntries));
}
