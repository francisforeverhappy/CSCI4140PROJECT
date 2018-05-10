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
        console.log(nd);
        console.log(obj);        
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
        console.log(sections);
        [course.lectures, course.tutorials, course.labs] = await Promise.all([Section.findById(lec_id).lean(),
            Section.find({'_id': {$in: course.tutorials}}).lean(),
            Section.find({'_id': {$in: course.labs}}).lean()
        ]);
        return res.send({sid: req.session.sid, course: course});
    });
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

module.exports = router;