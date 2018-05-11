const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    groupArray = require('group-array'),
    flatten = require('flat'),
    spawn = require('child_process').spawn;

const Course = require('../models/course'),
    Section = require('../models/section'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'),
    support = require('../support/js/support');


// search
router.post('/', middleware.asyncMiddleware(async (req, res) => {
    console.log('post /search');
    let courseInfo = req.body.key;
    let regex = new RegExp(courseInfo, 'i');
    let courses = await Course.find({$or: [{courseCode: {$regex: regex}}, {courseName: {$regex: regex}}]}, 'courseCode courseName classDetails.units sectionCode').limit(100);
    res.send({sid: req.session.sid, courses: courses});  
}));

function groupSection(el) {
    let info = el.meetingInfo;
    let newInfo = groupArray(info, 'daysTime.day', 'daysTime.timeSlot.start', 'daysTime.timeSlot.end', 'room');        
    el.meetingInfo = flatten(newInfo, {maxDepth: 4});
    return el;
}

router.post('/detail', middleware.asyncMiddleware(async (req, res) => {
    console.log('post /search/detail');
    let courseMessage = 'courseCode courseName sectionCode semester classDetails.units classDetails.grading componentDict';
    let sectionMessage = 'status meetingInfo';
    let courseId = mongoose.Types.ObjectId(req.body.key);
    let course = await Course.findById(courseId, courseMessage).lean();
    
    for (component in course.componentDict) {
        course.componentDict[component] = await Section.find({'_id': {$in: course.componentDict[component]}}, sectionMessage).lean();
        course.componentDict[component] = course.componentDict[component].map(groupSection); 
    }
    return res.send({sid: req.session.sid, course: course});
}));

router.get('/:courseId', middleware.asyncMiddleware(async (req, res) => {
    console.log('get /search/:courseId');
    let courseId = req.params.courseId;
    let course = await Course.findById(courseId).lean();
    for (component in course.componentDict) {
        course.componentDict[component] = await Section.find({'_id': {$in: course.componentDict[component]}}).lean();
    }

    course.comments = await Comment.find({courseCode: course.courseCode}, null, {sort: {numVotes: -1, time: -1}}).lean();
    course.comments = course.comments.map((comment) => {
        comment.time = new Date(comment.time).toLocaleString();
        return comment;
    });
    secCode = String(course.sectionCode);

    preSecCode = secCode.slice(0, -1) + String.fromCharCode(secCode.charCodeAt(secCode.length - 1) - 1);
    previous = await Course.findOne({courseCode: course.courseCode, semester: course.semester, sectionCode: preSecCode}, '_id');
    aftrSecCode = secCode.slice(0, -1) + String.fromCharCode(secCode.charCodeAt(secCode.length - 1) + 1);
    after = await Course.findOne({courseCode: course.courseCode, semester: course.semester, sectionCode: aftrSecCode}, '_id');
    
    if (previous) {
        course.previous = previous._id;
    }

    if (after) {
        course.after = after._id;
    }
    return res.render('course', {sid: req.session.sid, course: course});

}));

module.exports = router;