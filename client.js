// Establish WebSocket connection
const socket = new WebSocket(`ws://${window.location.hostname}:3001`);

socket.onopen = (event) => {
  console.log('[WS] Connected to WebSocket server');
  console.log('[WS] ReadyState:', socket.readyState);
};

socket.onmessage = (event) => {
  console.log('[WS] Received message:', event.data);
  try {
    const data = JSON.parse(event.data);
    console.log('[WS] Parsed data:', data);
  } catch (e) {
    console.error('[WS] Failed to parse message:', e);
  }
};

socket.onerror = (error) => {
  console.error('[WS] WebSocket error:', error);
};

socket.onclose = (event) => {
  console.log('[WS] Disconnected from WebSocket server');
  console.log('[WS] Close code:', event.code);
  console.log('[WS] Close reason:', event.reason);
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
  console.log('[EMAIL] Preparing to send email');
  console.log('[EMAIL] Parameters:', { to, subject, textLength: text?.length });

  try {
    const response = await fetch('/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, text }),
    });
    
    console.log('[EMAIL] Response status:', response.status);
    const data = await response.json();
    console.log('[EMAIL] Response data:', data);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('[EMAIL] Error sending email:', error);
    console.error('[EMAIL] Error details:', {
      message: error.message,
      stack: error.stack
    });
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
