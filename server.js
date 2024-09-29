const http = require('http'); // Switch to HTTP
const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors({
    origin: ['https://www.logme2.com'],
    methods: ['GET', 'POST'],
    credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.get('/', (req, res) => {
    res.send('Welcome to LogMe Backend!');
});

app.post('/send-email', async (req, res) => {
    const { to, subject, html } = req.body;
    if (!to || !subject || !html) {
        return res.status(400).json({ message: 'Missing email parameters' });
    }
    const msg = {
        to,
        from: 'logme2@logme2.com',
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

// Switch to HTTP for testing
const PORT = process.env.PORT || 3000;
http.createServer(app).listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});
