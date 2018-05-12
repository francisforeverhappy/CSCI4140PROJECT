const express = require('express'),
    router = express.Router(),
    spawn = require('child_process').spawn;

const Course = require('../models/course'),
    Section = require('../models/section'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'),
    support = require('../support/js/support');

router.get('/', (req, res) => {
    return res.render('index', {sid: req.session.sid});
});

router.get('/recommend', middleware.asyncMiddleware(async (req, res) => {
    const courseMessage = 'courseCode courseName classDetails.units sectionCode';
	if ('sid' in req.session) {
		console.log(req.session.reccourses);
		return res.send({sid: req.session.sid, courses: req.session.reccourses});
    } else {
        let courses = await Course.find({}, courseMessage, {sort: {avgRating: -1}}).limit(10).lean();
        return res.send({sid: req.session.sid, courses: courses});
    }
}));

router.get('/test', middleware.asyncMiddleware(async (req, res) => {
    let section = await Course.find({courseCode: new RegExp('ugfn', 'i')});
    console.log(section.length);
}));

// login
router.post('/login', (req, res, next) => {
    console.log('post /login');
    const courseMessage = 'courseCode courseName classDetails.units sectionCode';
	let sid = req.body.sid,
        pwd = req.body.pwd;
    let pythonProcess = spawn('python', ['support/py/recommend.py', sid, pwd]);
    pythonProcess.stdout.on('data', async (data) => {
        let dataTuple = data.toString().trim().split('\n');
        let result = dataTuple[0].trim();
        console.log(result);
		if (result == 'True') {
            let encryptedPwd = support.encrypt(sid, pwd)
            req.session.sid = sid;
            req.session.pwd = encryptedPwd;
            console.log('login success');
			let courseCodes = dataTuple[1].split(',');
			console.log(courseCodes);
			let courses = courseCodes.map(async (courseCode) => {
				course = await Course.findOne({courseCode: courseCode}, courseMessage).lean();
				return course;
			});
			courses = await Promise.all(courses);
			req.session.reccourses = courses;
			return res.send({success: true});
        } else {
            console.log('login fail');
            return res.send({success: false})
        }
    });
});

router.get('/logout', middleware.checkLogin, (req, res) => {
    console.log('get /logout');
    support.destroyCredential(req.session.sid);
    req.session.destroy(() => {
        console.log('user logged out');
    });
    res.redirect('back');
});

module.exports = router;
