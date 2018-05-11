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
    const courseMessage = 'courseCode courseName sectionCode semester classDetails.units classDetails.grading lectures tutorials labs';
    const sectionMessage = 'status meetingInfo sectionCode';
    let pythonProcess = spawn('python', ['support/py/import.py', sid, pwd]);
    
    pythonProcess.stdout.on('data', async (data) => {
        let courseArray = JSON.parse(data.toString());
        let courses = courseArray.map(async (courseInfo) => {
            let courseCode = courseInfo['courseCode'];
            let course = await Course.findOne({courseCode: courseCode, semester: semester}, courseMessage).lean();
            course.lec = null;
            course.tut = [];
            course.lab = [];
            
            [course.lectures, course.tutorials, course.labs] = await Promise.all([Section.findById(course.lectures, sectionMessage).lean(),
                Section.find({'_id': {$in: course.tutorials}}, sectionMessage).lean(),
                Section.find({'_id': {$in: course.labs}}, sectionMessage).lean()]);

            if (course.lec) {
                course.lectures.meetingInfo = flatten(groupArray(course.lectures.meetingInfo, 'daysTime.day', 'daysTime.timeSlot.start', 'daysTime.timeSlot.end', 'room'), {maxDepth: 4});
            }
            course.tutorials = course.tutorials.map(groupSection);
            course.labs = course.labs.map(groupSection);
            
            for (let i = 0; i < courseInfo['info'].length; i++) {
                section = courseInfo['info'][i];
                let courseComponent = section['courseComponent'];
                let sectionCode = section['sectionCode'];
                
                if (courseComponent == 'LEC') {
                    course.lec = course.lectures;
            
                } else if (courseComponent == 'TUT') {
                    let regex = new RegExp(sectionCode, 'i');
                    for (let j = 0; j < course.tutorials.length; j++) {
                        let tutorial = course.tutorials[j];
                        if (regex.test(tutorial.sectionCode)){
                            course.tut.push(j);
                            break;
                        }
                    }
                } else if (courseComponent == 'LAB') {
                    let regex = new RegExp(sectionCode, 'i');
                    for (let j = 0; j < course.labs.length; j++) {
                        let lab = course.labs[j];
                        if (regex.test(lab.sectionCode)){
                            course.lab.push(j);
                            break;
                        }
                    }
                }
            }
            return course;
        }); 

        courses = await Promise.all(courses).catch((error)=> {
            console.log(error.message);
        });
        return res.send({sid: req.session.sid, courses: courses});
    });
}));

module.exports = router;