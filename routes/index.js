const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
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


// search
router.post('/search', middleware.asyncMiddleware(async (req, res) => {
    let courseInfo = req.body.key;
    let regex = new RegExp(courseInfo, 'i');
    console.log('get ' + courseInfo);
    let courses = await Course.find({$or: [{courseCode: {$regex: regex}}, {courseName: {$regex: regex}}]}, 'courseCode courseName classDetails.units sectionCode');
    courses.forEach((course) => {
        console.log(course);
    });
    res.send({sid: req.session.sid, courses: courses});  
}));

//  doing
router.post('/detail', middleware.asyncMiddleware(async (req, res) => {
    let courseMessage = 'courseCode courseName sectionCode semester classDetails.units classDetails.grading lectures tutorials labs';
    let sectionMessage = 'status meetingInfo';
    let courseId = mongoose.Types.ObjectId(req.body.courseId);
    let course = await Course.findById(courseId, courseMessage);
    let lec_id = course.lectures;
    [course.lec, course.tutList, course.labList] = await Promise.all([Section.findById(lec_id, sectionMessage),
        Section.find({'_id': {$in: course.tutorials}}, sectionMessage),
        Section.find({'_id': {$in: course.labs}}, sectionMessage)]);
    res.send({sid: req.session.sid, course: course});
}));

router.get('/course/:courseCode', middleware.asyncMiddleware(async (req, res) => {
    let courseCode = req.params.courseCode;
    console.log('get ' + courseCode);
    
    let [course, comments] = await Promise.all([Course.findOne({courseCode: courseCode}), Comment.find({courseCode: courseCode})]);
    let lec_id = course.lectures;
    course.lec = null;
    course.tutList = [];
    course.labList = [];
    [course.lec, course.tutList, course.labList] = await Promise.all([Section.findById(lec_id),
        Section.find({'_id': {$in: course.tutorials}}),
        Section.find({'_id': {$in: course.labs}})]);
    console.log(course);
    return res.render('course', {sid: req.session.sid, course: course, comments: comments});
}));


router.get('/test/:courseCode', middleware.asyncMiddleware(async (req, res) => {
    let courseCode = req.params.courseCode;
    console.log('get ' + courseCode);
    let regex = new RegExp(courseCode, 'i');
    
    let course = await Course.findOne({courseCode: {$regex: regex}});
    console.log(course);
    return res.render('course', {sid: req.session.sid, course: course});
}));

// login needed
// comment
router.post('/createComment', middleware.checkLogin, (req, res) => {
    let courseCode = req.body.courseCode,
        text = req.body.text,
        rating = req.body.rating,
        sid = req.session.sid;
    let newComment = new Comment({courseCode: courseCode, text: text, rating: rating, sid: sid});
    newComment.save((err, result) => {
        console.log(result);
    });
});

router.post('/editComment', middleware.checkLogin, middleware.asyncMiddleware(async (req, res) => {
    
}));

router.post('/deleteComment', middleware.checkLogin, middleware.asyncMiddleware(async (req, res) => {
    
}));


router.get('/getWait', middleware.checkLogin, middleware.asyncMiddleware(async (req, res) => {
    console.log('get /getWait');
    // TBI
}));

router.get('/import', middleware.checkLogin, middleware.asyncMiddleware(async (req, res) => {
    console.log('get /import');
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
        res.send({sid: sid, sections: sections})
    });
    // TBI
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