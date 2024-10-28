const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const http = require('http');
const {google} = require('googleapis');
const fs = require('fs').promises;
const {authenticate} = require('@google-cloud/local-auth');
const https = require('https');
const {OAuth2Client} = require('google-auth-library');

// Load environment variables
require('dotenv').config();

// Add after dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();

// Initialize Google Cloud Storage with more secure credential handling
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// Add error handling for missing credentials
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Missing Google Cloud credentials configuration');
}

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

// Update CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'https://accounts.google.com', 'https://apis.google.com', 'https://*.googleapis.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// These are now redundant since express.static handles it
// app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
// app.use('/scripts', express.static(path.join(__dirname, 'public', 'scripts')));
// app.use('/styles', express.static(path.join(__dirname, 'public', 'styles')));

// Make sure Express sets the correct MIME type for JavaScript files
app.get('*.js', function(req, res, next) {
    res.type('application/javascript');
    next();
});

// Update the Content Security Policy headers
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self' https://accounts.google.com https://apis.google.com https://*.googleapis.com; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://cdn.jsdelivr.net https://*.googleusercontent.com https://*.google.com; " +
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://accounts.google.com; " +
        "frame-src 'self' https://accounts.google.com https://content.googleapis.com https://*.google.com; " +
        "img-src 'self' data: https: *.googleusercontent.com; " +
        "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://*.google.com https://*.googleapis.com http://localhost:* https://localhost:*; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'none'"
    );
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/AddLogEntry', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'AddLogEntry.html'));
});

app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});

app.get('/driver-log', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'DriverDeliveryLogForm.html'));
});

app.get('/finalize-log', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'FinalizeDailyLog.html'));
});

app.get('/output.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'output.css'));
});

app.get('/service-worker.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'service-worker.js'));
});

app.get('/view-logs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ViewLogs.html'));
});

// Update the routes to handle /public/ prefix
app.get('/public/DriverDeliveryLogForm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'DriverDeliveryLogForm.html'));
});

app.get('/public/AddLogEntry.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'AddLogEntry.html'));
});

app.get('/public/FinalizeDailyLog.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'FinalizeDailyLog.html'));
});

// Add detailed request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  next();
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  res.status(500).json({ error: err.message });
});

// CRUD operations using Google Cloud Storage

// Create a new log entry
app.post('/api/logs', async (req, res) => {
  console.log('=== Creating new log entry ===');
  try {
    const logEntry = req.body;
    const fileName = `logs/${Date.now()}_${logEntry.hotel.replace(/\s+/g, '_')}.json`;
    const file = bucket.file(fileName);
    
    console.log('Saving file:', fileName);
    await file.save(JSON.stringify(logEntry), {
      contentType: 'application/json',
      metadata: {
        createdAt: new Date().toISOString(),
        source: 'logme-app'
      },
    });

    console.log('Log entry saved successfully to Cloud Storage');
    res.status(201).json({ 
      message: 'Log entry created', 
      fileName,
      url: `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${fileName}`
    });
  } catch (error) {
    console.error('Error creating log entry:', error);
    res.status(500).json({ 
      error: 'Failed to create log entry',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Read all log entries
app.get('/api/logs', async (req, res) => {
  console.log('=== Fetching log entries ===');
  try {
    const [files] = await bucket.getFiles({ prefix: 'logs/' });
    console.log(`Found ${files.length} log entries`);

    const logEntries = await Promise.all(files.map(async (file) => {
      const [content] = await file.download();
      return JSON.parse(content.toString());
    }));

    res.json({ logs: logEntries });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch logs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update a log entry
app.put('/api/logs/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const updatedLogEntry = req.body;
    const file = bucket.file(`logs/${fileName}`);
    await file.save(JSON.stringify(updatedLogEntry), {
      contentType: 'application/json',
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    res.json({ message: 'Log entry updated' });
  } catch (error) {
    console.error('Error updating log entry:', error);
    res.status(500).json({ error: 'Failed to update log entry' });
  }
});

// Delete a log entry
app.delete('/api/logs/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    await bucket.file(`logs/${fileName}`).delete();
    res.json({ message: 'Log entry deleted' });
  } catch (error) {
    console.error('Error deleting log entry:', error);
    res.status(500).json({ error: 'Failed to delete log entry' });
  }
});

// Constants for Gmail API
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  console.log('Attempting to authorize Google API');
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    console.log('Loaded existing Google API credentials');
    return client;
  }
  console.log('No existing credentials found, authenticating...');
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    console.log('New credentials obtained, saving...');
    await saveCredentials(client);
  }
  console.log('Google API authorization complete');
  return client;
}

// Update the email configuration section
const emailConfig = {
  from: process.env.GMAIL_USER,
  sendgridKey: process.env.SENDGRID_API_KEY
};

// Update the sendEmail function
async function sendEmail(to, subject, htmlContent) {
  console.log('=== Initiating email send process ===');
  try {
    // Set SendGrid API key
    sgMail.setApiKey(emailConfig.sendgridKey);
    
    // Create email message
    const msg = {
      to: to,
      from: emailConfig.from, // verified sender email
      subject: subject,
      html: htmlContent,
    };

    console.log('Sending email with config:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    });

    // Send email
    await sgMail.send(msg);
    console.log('Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('SendGrid Error:', error);
    if (error.response) {
      console.error('Error body:', error.response.body);
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Update the email endpoint
app.post('/send-email', async (req, res) => {
    console.log('=== Email Send Request Received ===');
    try {
        const { to, subject, html } = req.body;
        console.log('Email request details:', { to, subject });
        
        await sendEmail(to, subject, html);
        console.log('Email sent successfully');
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Failed to send email:', error);
        res.status(500).json({ 
            message: 'Failed to send email', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.response?.body : undefined
        });
    }
});

// Load SSL/TLS certificates
// const privateKey = fs.readFileSync('path/to/your/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('path/to/your/cert.pem', 'utf8');
// const ca = fs.readFileSync('path/to/your/chain.pem', 'utf8');

// const credentials = {
//   key: privateKey,
//   cert: certificate,
//   ca: ca
// };

// Create HTTPS server
// const httpsServer = https.createServer(credentials, app);

// Start server
const port = process.env.PORT || 3000;
// httpsServer.listen(port, () => {
//     console.log(`HTTPS Server running on port ${port}`);
// });

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
});

// Middleware to check if the user is authenticated
async function isAuthenticated(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth Header:', authHeader);
  console.log('Token:', token ? token.substring(0, 20) + '...' : 'No token');

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify that token is a non-empty string
    if (typeof token !== 'string' || token.trim() === '') {
      console.error('Invalid token format');
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Check if token has three segments (header.payload.signature)
    if (token.split('.').length !== 3) {
      console.error('Token does not have three segments:', token.split('.').length);
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    console.log('Attempting to verify token');
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
    });

    console.log('Token verified successfully');
    const payload = ticket.getPayload();
    req.user = payload;
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    if (err.message.includes('Token used too late')) {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(403).json({ 
      error: 'Invalid token',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

// Update the Google Sign-In endpoint to create a JWT
app.post('/api/google-signin', async (req, res) => {
  console.log('Received Google Sign-In request');
  const { token } = req.body;
  if (!token) {
    console.error('No token provided in request');
    return res.status(400).json({success: false, message: 'No token provided'});
  }
  try {
    console.log('Verifying Google ID token');
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    console.log('Google ID token verified successfully');
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    const email = payload['email'];
    
    res.json({success: true, email, token: token});
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(401).json({success: false, message: 'Invalid token'});
  }
});

app.get('/api/google-client-id', (req, res) => {
  console.log('=== Sending Client ID to Frontend ===');
  console.log('Client ID being sent:', process.env.GOOGLE_CLIENT_ID);
  console.log('================================');
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

// Add this near the top of the file, after the imports
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

console.log('=== Google OAuth2 Configuration ===');
console.log('Client ID from environment:', CLIENT_ID);
console.log('Client ID length:', CLIENT_ID ? CLIENT_ID.length : 0);
console.log('================================');

