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

// Load environment variables
dotenv.config();

// Add after dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Serve scripts
app.use('/scripts', express.static(path.join(__dirname, 'public', 'scripts')));

// Serve styles
app.use('/styles', express.static(path.join(__dirname, 'public', 'styles')));

// Make sure Express sets the correct MIME type for JavaScript files
app.get('*.js', function(req, res, next) {
    res.type('application/javascript');
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

// Constants for Gmail API
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

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
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function sendEmail(to, subject, htmlContent) {
  const auth = await authorize();
  const gmail = google.gmail({version: 'v1', auth});
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    'From: Your Name <your-email@gmail.com>',
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    htmlContent
  ];
  const message = messageParts.join('\n');
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    console.log('Email sent successfully:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
// Updated email endpoint
app.post('/send-email', async (req, res) => {
    try {
        const { to, subject, html } = req.body;
        await sendEmail(to, subject, html);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Failed to send email:', error);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
