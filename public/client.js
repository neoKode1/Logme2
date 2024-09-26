// Establish WebSocket connection
const socket = new WebSocket(`ws://${window.location.hostname}:3001`);

socket.onopen = (event) => {
  console.log('Connected to WebSocket server');
};

socket.onmessage = (event) => {
  console.log('Message from server:', event.data);
};

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};

socket.onclose = (event) => {
  console.log('Disconnected from WebSocket server');
};

// Function to send log data via WebSocket
function sendLogData(logData) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(logData));
  } else {
    console.error('WebSocket is not open. ReadyState:', socket.readyState);
  }
}

// Function to send email via HTTP
async function sendEmail(to, subject, text) {
  try {
    const response = await fetch('/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, text }),
    });
    const data = await response.json();
    console.log('Email send response:', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Example usage
document.getElementById('logForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const logData = {
    timestamp: new Date().toISOString(),
    message: document.getElementById('logMessage').value,
  };
  sendLogData(logData);
});

document.getElementById('emailForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const to = document.getElementById('emailTo').value;
  const subject = document.getElementById('emailSubject').value;
  const text = document.getElementById('emailText').value;
  sendEmail(to, subject, text);
});