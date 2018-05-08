const express = require('express'),
    router = express.Router(),
    spawn = require('child_process').spawn;

const Course = require('../models/course'),
    Section = require('../models/section'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'),
    support = require('../support/js/support');

router.get('/', (req, res) => {
    let isLoggedIn = false;
    res.render('index', {sid: req.session.sid});
});

router.get('/test/:courseCode', middleware.asyncMiddleware(async (req, res) => {
    let courseCode = req.params.courseCode;
    console.log('get ' + courseCode);
    let regex = new RegExp(courseCode, 'i');
    
    let course = await Course.findOne({courseCode: {$regex: regex}});
    console.log(course);
    return res.render('course', {sid: req.session.sid, course: course});
}));



// login
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

router.get('/logout', middleware.checkLogin, (req, res) => {
    console.log('get /logout');
    support.destroyCredential(req.session.sid);
    req.session.destroy(() => {
        console.log('user logged out');
    });
    res.redirect('/');
});

module.exports = router;