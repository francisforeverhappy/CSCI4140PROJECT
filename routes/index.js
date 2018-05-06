const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

const CourseSession = require('../models/session')

router.get('/', (req, res) => {
    
});

router.get('/:courseId', (req, res) => {
    // on the original page
});

router.get('/:courseCode/details', (req, res) => {
    // new page

});


router.get('/import', (req, res) => {

});

router.get('/login', (req, res) => {
    res.render('login'); // TBI
});

router.post('/login', (req, res) => {
    // TBI authentication
    req.session.sid = req.body.sid;
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        console.log('user logged out');
    });
    res.redirect('/');
});

module.exports = router;