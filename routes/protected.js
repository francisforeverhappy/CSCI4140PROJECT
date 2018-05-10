const express = require('express'),
    router = express.Router(),
    spawn = require('child_process').spawn,
    groupArray = require('group-array'),
    flatten = require('flat');

const Course = require('../models/course'),
    Section = require('../models/section'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'),
    support = require('../support/js/support');

// login needed
router.post('/getWait', middleware.checkLogin, middleware.asyncMiddleware(async (req, res) => {
    console.log('get /getWait');
    let sid = req.session.sid,
        pwd = support.decrypt(sid, req.session.pwd);
    const semDir = {
        '2017-18 Term 1': 1,
        '2017-18 Term 2': 2
    };

    let course = await Course.findById(req.body.courseId);
    let term = semDir[course.semester]
    let pythonProcess = spawn('python', ['support/py/getWait.py', sid, pwd, term, course.courseCode]);
    pythonProcess.stdout.on('data', async (data) => {
        let obj = JSON.parse(data.toString());
        let sections = await Promise.all(obj.map(async (section) => { 
            let conditions = {
                'courseCode': section['courseCode'], 
                'sectionCode': section['sectionCode']
            };
            let update = {
                $set: {
                    'classAvail.availSeats': section['availSeats'], 
                    'classAvail.enrollTotal': section['enrollTotal'], 
                    'classAvail.availSeats': section['availSeats'], 
                    'classAvail.waitListTotal': section['waitListTotal'],
                    'classAvail.updatedTime': new Date().toISOString()
                }
            };
    
            let options = {
                new: true
            };
            let sectionb = await Section.findOneAndUpdate(conditions, update, options).catch((error) => {
                console.log(error);
            });
            console.log('section')
            return sectionb;
        }));
        console.log('back');
        return res.send({success: true});
    });
}));

function groupSection(el) {
    if (!el) {
        return null;
    }
    let info = el.meetingInfo;
    let newInfo = groupArray(info, 'daysTime.day', 'daysTime.timeSlot.start', 'daysTime.timeSlot.end', 'room');        
    el.meetingInfo = flatten(newInfo, {maxDepth: 4});
    return el;
}
// ??semester??
router.get('/import', middleware.checkLogin, middleware.asyncMiddleware(async (req, res) => {
    console.log('get /import');
    let sid = req.session.sid,
        pwd = support.decrypt(sid, req.session.pwd);
    // hardcoded
    const semester = '2017-18 Term 2';
    let pythonProcess = spawn('python', ['support/py/import.py', sid, pwd]);

    pythonProcess.stdout.on('data', async (data) => {
        let courseArray = JSON.parse(data.toString());
        let courses = courseArray.map(async (courseInfo) => {
            let courseCode = courseInfo['courseCode'];
            let course = await Course.findOne({courseCode: courseCode, semester: semester}).lean();
            course.lec = null;
            course.tut = [];
            course.lab = [];
            for (let i = 0; i < courseInfo['info'].length; i++) {
                section = courseInfo['info'][i];
                let courseComponent = section['courseComponent'];
                let sectionCode = section['sectionCode'];
                if (courseComponent == 'LEC') {
                    course.lec = await Section.findById(course.lectures).lean().catch((error) => {
                        console.log(error.message);
                    });
                } else if (courseComponent == 'TUT') {
                    let regex = new RegExp(sectionCode, 'i');
                    let tut = await Section.findOne({_id: {$in: course.tutorials}, sectionCode: {$regex: regex}}).lean().catch((error) => {
                        console.log('tutorials promise');
                        console.log(error.message);
                    });
                    course.tut.push(tut);
                    if (!tut) {
                        console.log(course.tutorials);
                        console.log(sectionCode);
                        console.log(course.courseCode);
                    }
                } else if (courseComponent == 'LAB') {
                    let regex = new RegExp(sectionCode, 'i');
                    let lab = await Section.findOne({_id: {$in: course.labs}, sectionCode: {$regex: regex}}).lean().catch((err) => {
                        console.log('tutorials promise');
                    });
                    course.lab.push(lab);
                    if (!lab) {
                        console.log(sectionCode);
                        console.log(course.courseCode);
                    }
                }
            }
            course.lectures = await course.lec;
            course.tutorials = await Promise.all(course.tut);
            course.labs = await Promise.all(course.lab);
            delete course.lec;
            delete course.tut;
            delete course.lab;
            return course;
        }); 
        courses = await Promise.all(courses).catch((error)=> {
            console.log(error.message);
        });
        courses.forEach((course) => {
            if (course.lectures) {
                course.lectures.meetingInfo = flatten(groupArray(course.lectures.meetingInfo, 'daysTime.day', 'daysTime.timeSlot.start', 'daysTime.timeSlot.end', 'room'), {maxDepth: 4});
            }
            course.tutorials = course.tutorials.map(groupSection);
            course.labs = course.labs.map(groupSection);
        });
        return res.send({sid: req.session.sid, courses: courses});
    });
}));

module.exports = router;