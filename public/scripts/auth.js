let googleClientId;

fetch('/api/google-client-id')
  .then(response => response.json())
  .then(data => {
    googleClientId = data.clientId;
    initializeGoogleSignIn();
  })
  .catch(error => console.error('Error fetching Google Client ID:', error));

function handleCredentialResponse(response) {
  // Send the token to your server
  fetch('/api/google-signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({token: response.credential}),
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('Signed in as: ' + data.email);
      localStorage.setItem('userEmail', data.email);
      updateUIForSignedInUser(data.email);
    } else {
      console.error('Sign-in failed');
    }
  })
  .catch(console.error);
}

function updateUIForSignedInUser(email) {
  const viewLogsButton = document.getElementById('viewLogsButton');
  if (viewLogsButton) {
    viewLogsButton.style.display = 'inline-block';
  }
  // You can add more UI updates here
}

function checkAuthState() {
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    updateUIForSignedInUser(userEmail);
  }
}

// Load the Google Sign-In API
function loadGoogleSignInAPI() {
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
  script.onload = initializeGoogleSignIn;
}

document.addEventListener('DOMContentLoaded', () => {
  loadGoogleSignInAPI();
  checkAuthState();
});

