const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const dotenv = require('dotenv');
const fs = require('node:fs');

const router = require('./router');
require('./database');  // Add this line to connect to MongoDB

dotenv.config();

const port = process.env.PORT || 3333;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

//load static assets
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

const sessionKey = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');

if (!process.env.SESSION_SECRET) {
    fs.writeFileSync('.env', `SESSION_SECRET=${sessionKey}\n`);
}

app.use(session({
    secret: sessionKey,
    resave: false,
    saveUninitialized: true
}));

app.use('/route', router);

app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

//home route
app.get('/', (req, res) => {
    res.render('base', { title: 'Login system' });
});

app.listen(port, () => {
    console.log(`Listening to the server on http://localhost:${port}`);
});