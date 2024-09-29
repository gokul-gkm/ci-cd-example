const express = require('express');
const router = express.Router();
const { User, Phone } = require('./database');

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    } else {
      return res.redirect('/');
    }
};

router.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

router.get('/', (req, res) => {
    res.render('base', { title: 'Login/Register System' });
});

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('base', { error: 'User already exists' });
        }
        const user = new User({ email, password });
        await user.save();
        res.render('base', { success: 'Registration successful. Please login.' });
    } catch (error) {
        res.render('base', { error: 'Error during registration' });
    }
});

router.post('/login', async (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/route/home');
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (user && await user.comparePassword(password)) {
            req.session.user = email;
            res.redirect('/route/home');
        } else {
            res.render('base', { error: 'Invalid username or password' });
        }
    } catch (error) {
        res.render('base', { error: 'Error during login' });
    }
});

router.get('/home', isAuthenticated, async (req, res) => {
    try {
        const phones = await Phone.find();
        res.render('home', { title: 'Home', user: req.session.user, phones });
    } catch (error) {
        console.log(error);
        res.render('home', { title: 'Home', error: 'Error fetching phone data' });
    }
});

router.get('/logout', isAuthenticated, (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
            res.send('Error');
        } else {
            res.render('base', { title: 'Login page', logout: 'Logout Successful' });
        }
    });
});

router.get('/init-data', async (req, res) => {
    try {
        // Initialize phones
        await Phone.deleteMany({});
        const phonesToAdd = [
            { title: 'iPhone 14', description: 'APPLE iPhone 14 (Midnight, 128 GB)', image: 'iphone14.jpg' },
            { title: 'S22 Ultra', description: 'SAMSUNG Galaxy S22 Ultra 5G (Phantom White, 256 GB) (12 GB RAM)', image: 's22ultra.jpg' },
            { title: 'Pixel 6a', description: 'Google Pixel 6a (Chalk, 128 GB) (6 GB RAM)', image: 'pixel.jpg' }
        ];
        await Phone.insertMany(phonesToAdd);

        // Add a default user
        const defaultUser = { email: 'admin@example.com', password: 'password123' };
        await User.findOneAndUpdate(
            { email: defaultUser.email },
            defaultUser,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.send('Data initialized successfully. Default user: admin@example.com / password123');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error initializing data');
    }
});

module.exports = router;