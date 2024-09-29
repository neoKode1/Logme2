const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');  // Ensure https is required

dotenv.config();

const app = express();

// Enable CORS for your frontend
app.use(cors({
    origin: ['https://www.logme2.com'],
    methods: ['GET', 'POST'],
    credentials: true,
}));

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle GET requests to root URL ("/")
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Serves your homepage
});

// POST route to send emails via SendGrid
app.post('/send-email', async (req, res) => {
    const { to, subject, html } = req.body;

    // Validate required fields
    if (!to || !subject || !html) {
        return res.status(400).json({ message: 'Missing email parameters' });
    }

    const msg = {
        to,
        from: 'logme2@logme2.com',  // Your verified SendGrid email
        subject,
        html,
    };

    try {
        // Send the email
        await sgMail.send(msg);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
});

// SSL options for HTTPS (adjust paths for your SSL cert files)
const options = {
    key: fs.readFileSync('/path/to/your/privkey.pem'),  // Replace with actual path
    cert: fs.readFileSync('/path/to/your/fullchain.pem'),  // Replace with actual path
};

// Start HTTPS server
const PORT = process.env.PORT || 3000;
https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS server running on port ${PORT}`);
});
