const express = require('express'),
    router = express.Router(),
    spawn = require('child_process').spawn;

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
        let sections = await Promise.all(obj.map((section) => { 
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
            return Section.findOneAndUpdate(conditions, update, options);
        }));
        [course.lectures, course.tutorials, course.labs] = await Promise.all([Section.findById(lec_id).lean(),
            Section.find({'_id': {$in: course.tutorials}}).lean(),
            Section.find({'_id': {$in: course.labs}}).lean()
        ]);
        return res.send({sid: req.session.sid, course: course});
    });
}));

// ??semester??
router.get('/import', middleware.asyncMiddleware(async (req, res) => {
    console.log('get /import');
    // let sid = req.session.sid,
    //     pwd = support.decrypt(sid, req.session.pwd);
    const components = ['LEC', 'LAB', 'TUT'];
    const semester = '2017-18 Term 2';
    let pythonProcess = spawn('python', ['support/py/import.py', '1155076990', 'zxcv$4321']);

    pythonProcess.stdout.on('data', async (data) => {
        let courseArray = JSON.parse(data.toString());
        let courses = courseArray.map(async (courseinfo) => {
            let courseCode = courseInfo['courseCode'];
            let course = await Course.findOne({courseCode: courseCode, semester: semester}).lean();
            let lectures = null;
            let tutorials = [];
            let labs = [];
            for (key in courseInfo) {
                if (key == 'LEC') {
                    lectures = Section.findById(course.lectures);
                } else if (key == 'TUT') {
                    tutorials.push(Section.findOne({_id: {$in: course.tutorials}, sectionCode: courseInfo['TUT']}));
                } else if (key == 'LAB') {
                    labs.push(Section.findOne({_id: {$in: course.labs}, sectionCode: courseInfo['LAB']}));
                }
            }
            course.lectures = await lectures;
            // course.
        }); 
    });
    // TBI
}));

module.exports = router;