let googleClientId;

function initializeGoogleSignIn() {
  console.log('=== Starting Google Sign-In Initialization ===');
  fetch('/api/google-client-id')
    .then(response => response.json())
    .then(data => {
      console.log('Received client ID from server:', data.clientId);
      console.log('Client ID length:', data.clientId.length);
      
      try {
        google.accounts.id.initialize({
          client_id: data.clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          prompt_parent_id: 'g_id_onload'
        });
        
        // Render the button explicitly
        google.accounts.id.renderButton(
          document.querySelector('.g_id_signin'),
          {
            type: 'standard',
            shape: 'pill',
            theme: 'filled_blue',
            text: 'continue_with',
            size: 'large',
            logo_alignment: 'center',
            width: 300
          }
        );

        console.log('Google Sign-In initialization and button render complete');
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    })
    .catch(error => {
      console.error('=== Error in Google Sign-In Initialization ===');
      console.error(error);
      console.error('==========================================');
    });
}

function handleCredentialResponse(response) {
  console.log('Handling credential response');
  const token = response.credential;
  fetch('/api/google-signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({token: token}),
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('Signed in as: ' + data.email);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('googleToken', data.token);
      updateUIForSignedInUser(data.email);
      
      // Update the navigation path to be relative
      window.location.href = 'DriverDeliveryLogForm.html';  // Remove the /public/ prefix
    } else {
      console.error('Sign-in failed:', data.message);
    }
  })
  .catch(error => {
    console.error('Error during sign-in:', error);
  });
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

function clearAuthData() {
    console.log('=== Clearing Authentication Data ===');
    localStorage.removeItem('googleToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('odometerStart');
    console.log('All auth data cleared from localStorage');
    console.log('===================================');
}

document.addEventListener('DOMContentLoaded', () => {
  clearAuthData(); // Clear any existing auth data
  initializeGoogleSignIn();
  checkAuthState();
});
