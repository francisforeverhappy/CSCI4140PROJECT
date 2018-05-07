const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    spawn = require('child_process').spawn;

const Course = require('../models/course'),
    Section = require('../models/section'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'),
    support = require('../support/js/support');

router.get('/', (req, res) => {
    let isLoggedIn = false;
    console.log(req.session.sid);
    res.render('index', {sid: req.session.sid});
});

router.post('/search', (req, res) => {
    // on the original page
    let regex = new RegExp(escapeRegex(req.body.courseInfo), 'gi');
    Course.find({$or: [{courseCode: regex}, {courseName: regex}]}, (err, courses) => {
        if (err) {
            return console.error(err);
        } else {
            if (courses.length < 1) {
                message = 'No match';
            }
        }
        res.render('index', {sid: req.session.sid, courses: courses});
    });
});

router.get('/:courseCode/details', (req, res) => {
    // new page
    console.log('get /details');
    Course.findOne({courseCode: req.params.courseCode}, (err, course) => {
        if (err) {
            return console.error('courseSession find error');
        }
        console.log(course.description);
        res.render('index', {sid: req.session.sid, sessions: course});
    });
});

router.get('/getWait', (req, res) => {
    console.log('get /getWait');
    if (!('sid' in req.session)) {
        console.log('getWaite without loggin');
        return res.redirect('/');
    }
    // TBI

});

router.get('/import', (req, res) => {
    console.log('get /import');
    if (!('sid' in req.session)) {
        console.log('import without loggin');
        return res.redirect('/');
    }
    // TBI
});

router.post('/login', (req, res, next) => {
    console.log('post /login')
    let sid = req.body.sid,
        pwd = req.body.pwd;
    let pythonProcess = spawn('python', ['support/py/login.py', sid, pwd]);
    pythonProcess.stdout.on('data', (data) => {
        let result = data.toString().trim(); 
        if (result == 'True') {
            let encryptedPwd = support.encrypt(sid, pwd)
            req.session.sid = sid;
            req.session.pwd = encryptedPwd;
            console.log('login success');
        } else {
            console.log('login fail');
        }
        res.redirect('/');
    });
});

router.get('/login', (req, res) => {
    // for debug
    res.render('login');
});

router.get('/logout', (req, res) => {
    console.log('get /logout');
    if ('sid' in req.session) {
        console.log(req.session.sid + ' ' + req.session.pwd);
        support.destroyCredential(req.session.sid);
        req.session.destroy(() => {
            console.log('user logged out');
        });
    } else {
        console.log("user haven't logged in");
    }
    res.redirect('/');
});

module.exports = router;