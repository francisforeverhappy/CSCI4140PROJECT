const express = require('express'),
    router = express.Router(),
    spawn = require('child_process').spawn;

const Course = require('../models/course'),
    Section = require('../models/section'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'),
    support = require('../support/js/support');

// login needed
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

module.exports = router;