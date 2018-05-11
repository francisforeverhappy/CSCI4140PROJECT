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
    console.log('post /protected/getWait');
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
        console.log('data got');
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
            return sectionb;
        }));
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
// ??component name??
router.get('/import', middleware.checkLogin, middleware.asyncMiddleware(async (req, res) => {
    console.log('get /protected/import');
    let sid = req.session.sid,
        pwd = support.decrypt(sid, req.session.pwd);
    // hardcoded
    const semester = '2017-18 Term 2';
    const courseMessage = 'courseCode courseName sectionCode semester classDetails.units classDetails.grading componentDict';
    const sectionMessage = 'status meetingInfo sectionCode';
    let pythonProcess = spawn('python', ['support/py/import.py', sid, pwd]);
    
    pythonProcess.stdout.on('data', async (data) => {
        let courseArray = JSON.parse(data.toString());
        let courses = courseArray.map(async (courseInfo) => {
            let courseCode = courseInfo['courseCode'];
            let tmpCourses = await Course.find({courseCode: courseCode, semester: semester}, courseMessage).lean();
            let course = false;
            for (let k = 0; k < tmpCourses.length; k++) {
                if (courseInfo['info'][0]['sectionCode'].indexOf(tmpCourses[k].sectionCode) == 0) {
                    course = tmpCourses[k];
                    break;
                }
            }
            if (!course) {
                console.log(tmpCourses[0].sectionCode);
                console.log(courseInfo['info'][0]['courseComponent']);
            }
            for (component in course.componentDict) {
                let tmp_component = component;
                let tmp = await Section.find({'_id': {$in: course.componentDict[component]}}, sectionMessage).lean();
                course.componentDict[tmp_component] = tmp.map(groupSection); 
            }

            course.compDictSelected = {};
            for (let i = 0; i < courseInfo['info'].length; i++) {
                section = courseInfo['info'][i];
                let courseComponent = section['courseComponent'];
                let sectionCode = section['sectionCode'];
                let regex = new RegExp(sectionCode, 'i');
                for (let j = 0; j < course.componentDict[courseComponent].length; j++) {
                    let sect = course.componentDict[courseComponent][j];
                    if (courseComponent == 'CLW') {
                        // console.log(course.componentDict['CLW']);
                    }
                    if (regex.test(sect.sectionCode)){
                        course.compDictSelected[courseComponent] = j;
                        break;
                    }
                      
                }
            }
            return course;
        }); 
        courses = await Promise.all(courses);
        console.log('import done with courses ' + courses.length);
        return res.send({sid: req.session.sid, courses: courses});
    });
}));

module.exports = router;