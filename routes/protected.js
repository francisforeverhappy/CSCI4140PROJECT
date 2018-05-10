const express = require('express'),
    router = express.Router(),
    spawn = require('child_process').spawn;

const Course = require('../models/course'),
    Section = require('../models/section'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'),
    support = require('../support/js/support');

// login needed
router.post('/getWait', middleware.asyncMiddleware(async (req, res) => {
    console.log('get /getWait');
    // let sid = req.session.sid,
    //     pwd = support.decrypt(sid, req.session.pwd);
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
            let sectionb = await Section.findOneAndUpdate(conditions, update, options);
            return sectionb;
        }));
    
        [course.lectures, course.tutorials, course.labs] = await Promise.all([Section.findById(lec_id).lean(),
            Section.find({'_id': {$in: course.tutorials}}).lean(),
            Section.find({'_id': {$in: course.labs}}).lean()
        ]);
        return res.send({sid: req.session.sid, course: course});
    });
}));

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
        console.log('courseArray');
        console.log(courseArray);
        let courses = courseArray.map(async (courseInfo) => {
            let courseCode = courseInfo['courseCode'];
            let course = await Course.findOne({courseCode: courseCode, semester: semester}).lean();
            // console.log('course');
            // console.log(course);
            let lectures = null;
            let tutorials = [];
            let labs = [];
            courseInfo['info'].forEach((section) => {
                let courseComponent = section['courseComponent'];
                let sectionCode = section['sectionCode'];
                if (courseComponent == 'LEC') {
                    lectures = Section.findById(course.lectures);
                } else if (courseComponent == 'TUT') {
                    tutorials.push(Section.findOne({_id: {$in: course.tutorials}, sectionCode: courseInfo['TUT']}));
                } else if (courseComponent == 'LAB') {
                    labs.push(Section.findOne({_id: {$in: course.labs}, sectionCode: courseInfo['LAB']}));
                }
            });
            course.lecture = await lectures;
            course.tutorials = await Promise.all(tutorials);
            course.labs = await Promise.all(labs);
            return course;
        }); 
        courses = await Promise.all(courses).catch((error)=> {
            console.log(error.message);
        });
        courses.forEach((course) => {
            console.log(course.courseCode);
        });
        return res.send({sid: req.session.sid, courses: courses});
    });
}));

module.exports = router;