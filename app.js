require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const stripeWebHook = require('./middlewares/stripe-webhook');

const app = express();


// Set CROS headers
const corsOptions = {
  origin: "http://localhost:5173", 
  credentials: true,
};

// Checkout webhook
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebHook
);

app.use(express.json());
app.use(cors(corsOptions));

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');


// Parse incoming data
app.use(bodyParser.json());
app.use(cookieParser());


// Server images statically 
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/shop', shopRoutes);


// Errors middleware
app.use((error, req, res, next) => {
    console.log('Error Middleware: \n' + error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data || [];
    res.status(status).json({ message: message, errors: data });
});


mongoose.connect(process.env.DATABASE_URI)
    .then(() => {
        app.listen(process.env.SERVER_PORT, () => {
          console.log(`Server is runinng on port ${process.env.SERVER_PORT}`);
        });
    }).catch(err => {
        console.log(err);
    });
