const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

const CourseSession = require('../models/session'),
    middleware = require('../middleware')

router.get('/', (req, res) => {
    res.render('index');    
});

router.post('/search', (req, res) => {
    // on the original page
    let regex = new RegExp(escapeRegex(req.body.courseInfo), 'gi');
    let message = null;
    CourseSession.find({$or: [{courseCode: regex}, {courseName: regex}]}, (err, allSessions) => {
        if (err) {
            return console.error(err);
        } else {
            if (allSessions.length < 1) {
                message = 'No match';
            }
        }
        res.render('index', {sessions: allSessions, message: message});
    });
});

router.get('/:courseCode/details', (req, res) => {
    // new page
    console.log('get /details');
    CourseSession.findOne({courseCode: req.params.courseCode}, (err, courseSession) => {
        if (err) {
            return console.error('courseSession find error');
        }
        console.log(courseSession.description);
        res.render('index', {sessions: courseSession});
    });
});

router.get('/updateWaite', (req, res) => {

});

router.get('/import', (req, res) => {
    console.log('get /import');
    // let courseNumbers = middleware.import(req.session.sid, req.session.pwd);
    // courseNumber.forEach((courseNumber) => {
    //     CourseSession.findOne({: req.params.courseCode}, (err, courseSession) => {
    //         if (err) {
    //             return console.error('courseSession find error');
    //         }
    //         console.log(courseSession.description);
    //         res.render('index', {sessions: courseSession});
    //     }); 
    // });
});

router.get('/login', (req, res) => {
    console.log('get /login');
    res.render('login');
});

router.post('/login', (req, res) => {
    // TBI authentication
    console.log('post /login')
    let sid = req.body.sid,
        pwd = req.body.pwd;
    if (middleware.checkLogin(sid, pwd)) {
        req.session.sid = sid;
        req.session.pwd = pwd;
        res.render('login', {message: 'login successful'});
    } else {
        res.render('login', {message: 'login failed'});
    }
});

router.get('/logout', (req, res) => {
    console.log('get /logout');
    req.session.destroy(() => {
        console.log('user logged out');
    });
    res.redirect('/');
});

module.exports = router;