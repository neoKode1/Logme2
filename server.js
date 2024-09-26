const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Middleware for CORS to allow requests from both GitHub Pages and localhost during development
app.use(cors({
    origin: ['https://neokode1.github.io', 'http://localhost:3000'], // Allow GitHub Pages and localhost
    methods: ['GET', 'POST'], // Allow only GET and POST requests
    credentials: true // Enable credentials if needed (cookies, etc.)
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set SendGrid API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Serve static files from the "public" directory (for HTML, CSS, JS files)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Ensure the correct path is being used
});

// POST route to handle sending emails
app.post('/send-email', async (req, res) => {
    const { to, subject, html } = req.body;

    // Check for missing email parameters
    if (!to || !subject || !html) {
        return res.status(400).json({ message: 'Missing email parameters' });
    }

    // Set up email content
    const msg = {
        to,
        from: 'logme2@logme2.com', // Replace with your verified sender email
        subject,
        html,
    };

    try {
        // Send email via SendGrid
        await sgMail.send(msg);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
});

// SSL certificate and key setup for HTTPS
const options = {
    key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')), // Ensure correct path for SSL key
    cert: fs.readFileSync(path.join(__dirname, 'localhost.pem')), // Ensure correct path for SSL cert
};

// Start HTTPS server on port 3000 or use the port from environment variables
const PORT = process.env.PORT || 3000;
https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS server running on https://localhost:${PORT}`);
});
