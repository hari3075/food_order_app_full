import dotenv from'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
console.log("MongoDB URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Define Order Schema & Model
const orderSchema = new mongoose.Schema({
    name: String,
    email: String,
    street: String,
    city: String,
    postalCode: String,
});

const Order = mongoose.model('Order', orderSchema);

// Nodemailer Transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});
console.log("Using email:", process.env.EMAIL_USER);
console.log("Password (masked):", process.env.EMAIL_PASS);


// API Endpoint to Handle Form Submission
app.post('/submit-order', async (req, res) => {
    const { name, email, street, city, postalCode } = req.body;

    try {
        // Save order to MongoDB
        const newOrder = new Order({ name, email, street, city, postalCode });
        await newOrder.save();

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: "harishannam66@gmail.com",
            subject: 'Order Confirmation',
            text: `Hello ${name},\n\nYour order has been placed successfully!\n\nDetails:\nStreet: ${street}\nCity: ${city}\nPostal Code: ${postalCode}\n\nThank you for your order!`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Order placed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error placing order', error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
