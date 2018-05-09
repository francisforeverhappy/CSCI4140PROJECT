const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    spawn = require('child_process').spawn;

const Course = require('../models/course'),
    Section = require('../models/section'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'),
    support = require('../support/js/support');


// search
router.post('/', middleware.asyncMiddleware(async (req, res) => {
    let courseInfo = req.body.key;
    let regex = new RegExp(courseInfo, 'i');
    // console.log('get ' + courseInfo);
    let courses = await Course.find({$or: [{courseCode: {$regex: regex}}, {courseName: {$regex: regex}}]}, 'courseCode courseName classDetails.units sectionCode').limit(100);
    // courses.forEach((course) => {
        // console.log(course);
    // });
    res.send({sid: req.session.sid, courses: courses});  
}));

router.post('/detail', middleware.asyncMiddleware(async (req, res) => {
    let courseMessage = 'courseCode courseName sectionCode semester classDetails.units classDetails.grading lectures tutorials labs';
    let sectionMessage = 'status meetingInfo';
    let courseId = mongoose.Types.ObjectId(req.body.key);
    let course = await Course.findById(courseId, courseMessage);
    let lec_id = course.lectures;
    [course.lectures, course.tutorials, course.labs] = await Promise.all([Section.findById(lec_id, sectionMessage),
        Section.find({'_id': {$in: course.tutorials}}, sectionMessage),
        Section.find({'_id': {$in: course.labs}}, sectionMessage)]);
    console.log(course.lectures.meetingInfo[0])
    res.send({sid: req.session.sid, course: course});
}));

router.get('/:courseCode', middleware.asyncMiddleware(async (req, res) => {
    let courseCode = req.params.courseCode;
    console.log('get ' + courseCode);
    let [course, comments] = await Promise.all([Course.findOne({courseCode: courseCode}), Comment.find({courseCode: courseCode})]);
    let lec_id = course.lectures;
    course.lec = null;
    course.tutList = [];
    course.labList = [];
    [course.lectures, course.tutorials, course.labs] = await Promise.all([Section.findById(lec_id),
        Section.find({'_id': {$in: course.tutorials}}),
        Section.find({'_id': {$in: course.labs}})]);
    console.log(course);
    return res.render('course', {sid: req.session.sid, course: course, comments: comments});
}));

module.exports = router;