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
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

// Add after dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

// CORS configuration
app.use(cors({
    origin: 'https://neokode1.github.io',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

app.get('/view-logs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ViewLogs.html'));
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
  try {
    const logEntry = req.body;
    const fileName = `logs/${Date.now()}.json`;
    const file = bucket.file(fileName);
    await file.save(JSON.stringify(logEntry), {
      contentType: 'application/json',
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    res.status(201).json({ message: 'Log entry created', fileName });
  } catch (error) {
    console.error('Error creating log entry:', error);
    res.status(500).json({ error: 'Failed to create log entry' });
  }
});

// Read all log entries (with pagination)
app.get('/api/logs', isAuthenticated, async (req, res) => {
  try {
    const { driverName, truckNumber, date, hotel } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const [files] = await bucket.getFiles({ prefix: 'logs/' });
    
    // Filter logs based on search criteria
    const filteredLogs = await Promise.all(files.map(async (file) => {
      const [contents] = await file.download();
      const log = JSON.parse(contents.toString());
      
      if (
        (!driverName || log.driverName.toLowerCase().includes(driverName.toLowerCase())) &&
        (!truckNumber || log.truckNumber === truckNumber) &&
        (!date || log.date === date) &&
        (!hotel || log.stops.some(stop => stop.hotel.toLowerCase().includes(hotel.toLowerCase())))
      ) {
        return log;
      }
      return null;
    }));

    const validLogs = filteredLogs.filter(log => log !== null);
    const totalLogs = validLogs.length;
    const totalPages = Math.ceil(totalLogs / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedLogs = validLogs.slice(startIndex, endIndex);

    res.json({
      logs: paginatedLogs,
      currentPage: page,
      totalPages: totalPages,
      totalLogs: totalLogs
    });
  } catch (error) {
    console.error('Error searching log entries:', error);
    res.status(500).json({ error: 'Failed to search log entries' });
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
function isAuthenticated(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}

// Update the Google Sign-In endpoint to create a JWT
app.post('/api/google-signin', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    const email = payload['email'];
    
    // Create a JWT
    const jwtToken = jwt.sign({ userId: userid, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({success: true, email, token: jwtToken});
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(401).json({success: false, message: 'Invalid token'});
  }
});
