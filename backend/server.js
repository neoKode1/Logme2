const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Middleware for CORS
app.use(cors({
    origin: ['https://logme2.com'],  // Allow requests from your GitHub Pages site
    methods: ['GET', 'POST'],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set SendGrid API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// POST route to handle sending emails via SendGrid
app.post('/send-email', async (req, res) => {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
        return res.status(400).json({ message: 'Missing email parameters' });
    }

    const msg = {
        to,
        from: 'logme2@logme2.com', // Use your verified email
        subject,
        html,
    };

    try {
        await sgMail.send(msg);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
