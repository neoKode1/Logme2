const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');

dotenv.config();

const app = express();

// Enable CORS for multiple origins (desktop and mobile)
app.use(cors({
    origin: ['https://www.logme2.com', 'https://logme2.com'], // Allow both www and non-www versions
    methods: ['GET', 'POST'],
    credentials: true,
}));

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set SendGrid API Key for email functionality
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all route to serve index.html for any undefined routes (useful for SPAs or mobile)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route for sending emails
app.post('/send-email', async (req, res) => {
    const { to, subject, html } = req.body;

    // Validate required email fields
    if (!to || !subject || !html) {
        return res.status(400).json({ message: 'Missing email parameters' });
    }

    const msg = {
        to,
        from: 'logme2@logme2.com', // Use your verified sender email
        subject,
        html,
    };

    try {
        // Send email using SendGrid
        await sgMail.send(msg);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
});

// SSL options for HTTPS (update paths to your certificate and key files)
const options = {
    key: fs.readFileSync('/path/to/your/privkey.pem'),
    cert: fs.readFileSync('/path/to/your/fullchain.pem'),
};

// Start HTTPS server
const PORT = process.env.PORT || 3000;
https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS server running on https://0.0.0.0:${PORT}`);
});
