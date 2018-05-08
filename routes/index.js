const express = require('express'),
    router = express.Router(),
    // async = require('async'),
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


router.post('/search', middleware.asyncMiddleware(async (req, res) => {
    // on the original page
    let courseInfo = req.body.courseInfo;
    let regex = new RegExp(courseInfo, 'i');
    console.log('get ' + courseInfo);
    console.log(regex);
    let courses = await Course.find({$or: [{courseCode: {$regex: regex}}, {courseName: {$regex: regex}}]});
    console.log(courses);
    courses.forEach((course) => {
        console.log(course.courseName);
        console.log(course.courseCode);
    });
    res.render('index', {sid: req.session.sid, courses: courses});    
}));

router.get('/search/:courseCode', middleware.asyncMiddleware(async (req, res) => {
    let courseCode = req.params.courseCode;
    console.log('get ' + courseCode);
    let regex = new RegExp(courseCode, 'i');
    
    let course = await Course.findOne({courseCode: {$regex: regex}});
    let lec_id = course.lectures;
    course.lec = null;
    course.tutList = [];
    course.labList = [];
    [course.lec, course.tutList, course.labList] = await Promise.all([Section.findById(lec_id)],
        Section.find({'_id': {$in: course.tutorials}}),
        Section.find({'_id': {$in: course.labs}}));
    console.log(course);
    return res.render('course', {sid: req.session.sid, course: course});
}));

router.get('/getWait', (req, res) => {
    console.log('get /getWait');
    if (!('sid' in req.session)) {
        console.log('getWaite without loggin');
        return res.redirect('/');
    }
    // TBI
});

router.get('/import', middleware.asyncMiddleware(async (req, res) => {
    console.log('get /import');
    if (!('sid' in req.session)) {
        console.log('import without loggin');
        return res.redirect('/');
    }
    let sid = req.session.sid,
        pwd = support.decrypt(sid, req.session.pwd);
    let pythonProcess = spawn('python', ['support/py/import.py', sid, pwd]);
    pythonProcess.stdout.on('data', async (data) => {
        let courseNumbers = data.toString().trim().split(',').map(Number); 
        console.log(courseNumbers);
        let sections = await Section.find({courseNumber: {$in: courseNumbers}});
        sections.map(async section => {
            section.course = await Course.findById(section.courseInfo);
        });
        res.render('index', {sid: sid, sections: sections})
    });
    // TBI
}));

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