require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Twilio credentials from .env file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // For parsing application/json

// Endpoint to send SMS
app.post('/send-sms', async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).send({ success: false, message: 'Recipient number and message are required.' });
    }

    try {
        await client.messages.create({
            body: message,
            to: to, // Text this number
            from: twilioPhoneNumber // From a valid Twilio number
        });
        console.log(`SMS sent to ${to}: ${message}`);
        res.status(200).send({ success: true, message: 'SMS sent successfully!' });
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).send({ success: false, message: 'Failed to send SMS.', error: error.message });
    }
});

// Basic endpoint to check server status
app.get('/', (req, res) => {
    res.send('MotoPulse SMS Server is running!');
});

app.listen(port, () => {
    console.log(`SMS Server listening at http://localhost:${port}`);
});