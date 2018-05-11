const express = require('express'),
    router = express.Router(),
    spawn = require('child_process').spawn;

const Course = require('../models/course'),
    Section = require('../models/section'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'),
    support = require('../support/js/support');

router.get('/', (req, res) => {
    let isLoggedIn = false;
    res.render('index', {sid: req.session.sid});
});


router.get('/test/:courseCode', middleware.asyncMiddleware(async (req, res) => {
    let section = await Course.findOne({courseCode: 'ELTU3014'});
    console.log(section);
}));



// login
router.post('/login', (req, res, next) => {
    console.log('post /login')
    let sid = req.body.sid,
        pwd = req.body.pwd;
    let pythonProcess = spawn('python', ['support/py/login.py', sid, pwd]);
    pythonProcess.stdout.on('data', (data) => {
        let result = data.toString().trim(); 
        if (result == 'True') {
            let encryptedPwd = support.encrypt(sid, pwd)
            req.session.sid = sid;
            req.session.pwd = encryptedPwd;
            console.log('login success');
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