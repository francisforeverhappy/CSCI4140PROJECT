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
    let courseMessage = 'courseCode courseName sectionCode semester classDetails.units classDetails.grading lectures tutorials labs';
    let sectionMessage = 'status meetingInfo';
    let courseId = mongoose.Types.ObjectId(req.body.key);
    let course = await Course.findById(courseId, courseMessage).lean();
    let lec_id = course.lectures;
    [course.lectures, course.tutorials, course.labs] = await Promise.all([Section.findById(lec_id, sectionMessage).lean(),
        Section.find({'_id': {$in: course.tutorials}}, sectionMessage).lean(),
        Section.find({'_id': {$in: course.labs}}, sectionMessage).lean()]);
    course.lectures.meetingInfo = flatten(groupArray(course.lectures.meetingInfo, 'daysTime.day', 'daysTime.timeSlot.start', 'daysTime.timeSlot.end', 'room'), {maxDepth: 4});
    course.tutorials = course.tutorials.map(groupSection);
    course.labs = course.labs.map(groupSection);
    res.send({sid: req.session.sid, course: course});
}));

router.get('/:courseId', middleware.asyncMiddleware(async (req, res) => {
    let courseId = req.params.courseId;
    let course = await Course.findById(courseId).lean();
    [course.lectures, course.tutorials, course.labs, course.comments, course.ratings] = await Promise.all([Section.findById(course.lectures).lean(),
        Section.find({'_id': {$in: course.tutorials}}).lean(),
        Section.find({'_id': {$in: course.labs}}).lean(),
        Comment.find({courseCode: course.courseCode}),
        Comment.aggregate([
            {
                $match: {
                    courseCode: course.courseCode
                }
            }, 
            {
                $group: {
                    _id: null,
                    avgRating: {$avg: "$rating"},
                    numRating: {$sum: 1}
                }
            }
        ])
    ]);
    return res.render('course', {sid: req.session.sid, course: course});
}));

module.exports = router;