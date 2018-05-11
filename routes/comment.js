const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    spawn = require('child_process').spawn;

const Course = require('../models/course'),
    Section = require('../models/section'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'),
    support = require('../support/js/support');

// comment
function checkCourse(sid, pwd, courseCode) {
    let pythonProcess = spawn('python', ['support/py/login.py', sid, pwd]);
    pythonProcess.stdout.on('data', (data) => {
        let result = data.toString().trim(); 
        if (result == 'True') {
            console.log('courseCoursesuccess');
            return true;
        } else {
            console.log('checkCoures fail');
            return false;
        }
    });
}

router.post('/create', middleware.checkLogin, middleware.asyncMiddleware(async (req, res) => {
    console.log('post /comment/create')
    let sid = req.session.sid,
        pwd = support.decrypt(sid, req.session.pwd);

    let courseId = req.body.courseId,
        text = req.body.text,
        rating = req.body.rating;

    let course = await Course.findById(courseId);
        
    if (!checkCourse(sid, pwd, courseCode)) {
        console.log("course didn't take");
        return res.send({success: false, error: "course didn't take"});
    }

    if (!rating) {
        console.log('rating is required');
        return res.send({success: false, error: "rating is null"});
    }

    let oldComment = await Comment.findOne({courseCode: course.courseCode, author: sid});
    if (oldComment) {
        console.log('exist');
        return res.send({success: false, error: "comment already exists"});
    }

    let newComment = new Comment({
        _id: mongoose.Types.ObjectId(),
        courseCode: course.courseCode, 
        semester: course.semester, 
        sectionCode: course.sectionCode,
        time: new Date().toISOString(), 
        text: text, 
        rating: rating, 
        author: sid
    });
    newComment.save();

    Course.find({courseCode: course.courseCode}, (err, courses) => {
        let newNumRating = courses[0].numRating + 1;
        let newAvgRating = (courses[0].avgRating * courses[0].numRating + Number(rating)) / newNumRating;
        courses.forEach((course) => {
            course.numRating = newNumRating;
            course.avgRating = newAvgRating;
            course.save()
        });
        console.log('success');
        return res.redirect('back');
    });
}));

router.post('/edit', (req, res) => {
    let commentId = req.body.commentId,
        text = req.body.text,
        rating = req.body.rating;
    
    console.log('post /comment/edit');
    if (!rating) {
        console.log('rating is null');
        return res.send({success: false, error: "rating is required"});
    }
    
    Comment.findByIdAndUpdate(commentId, {time: new Date().toISOString(), text: text, rating: rating}, {new: false}, (err, comment, resp) => {
        if (err) {
            console.log(err.message);
            return res.send({success: false});
        }
        if (!comment) {
            console.log('there is no original comment');
            return res.send({success:false, error: "comment has been deleted"});            
        }
        let oldRating = comment.rating;
        Course.find({courseCode: comment.courseCode}, (err, courses) => {
            let numRating = courses[0].numRating;
            let newAvgRating = (courses[0].avgRating * numRating - Number(oldRating) + Number(rating)) / Number(numRating);
            courses.forEach((course) => {
                course.avgRating = newAvgRating;
                course.save();
            });
            return res.redirect('back');
        });
    });
});

router.post('/delete', (req, res) => {
    let commentId = req.body.commentId;
    console.log('post /comment/delete');

    Comment.findById(commentId, (err, comment) => {
        if (err) {
            console.log(err.message);
            return res.send({success: false});
        }
        if (!comment) {
            res.send({success: false});
            return console.log('no this comment');
        }
        let oldRating = comment.rating;
        Course.find({courseCode: comment.courseCode}, (err, courses) => {
            let newNumRating = courses[0].numRating - 1;
            let newAvgRating = null;
            if (Number(newNumRating) > 0) {
                newAvgRating = (courses[0].avgRating * courses[0].numRating - Number(oldRating)) / Number(newNumRating);
            }
            courses.forEach((course) => {
                course.numRating = newNumRating;
                course.avgRating = newAvgRating;
                course.save();
            });
            comment.remove();
            console.log('done');
            res.redirect('back');
        });
    }); 
});

router.get('/deleteAll', (req, res) => {
    Comment.collection.drop();
    Course.find({}, (err, courses) => {
        courses.forEach((course) => {
            course.avgRating = null;
            course.numRating = 0;
            course.save();
        });
        console.log('done');
    });
});

router.get('/testCases', (req, res) => {
    Comment.collection.drop();
    for (let i = 0; i < 100; i++) {
        Course.count().exec(function (err, count) {
            // Get a random entry
            let random = Math.floor(Math.random() * count)
            let tmpMessage = 'comment: ' + i;
            // Again query all users but only fetch one offset by our random #
            Course.findOne().skip(random)
                .exec((err, course) => {
                    let commentObj = {
                        _id: mongoose.Types.ObjectId(),
                        courseCode: course.courseCode,
                        semester: course.semester,
                        sectionCode: course.sectionCode,
                        time: new Date().toISOString(),
                        text: tmpMessage,
                        author: "1155076990",
                        rating: Math.floor(Math.random() * 5 + 1)
                    }

                    let newComment = new Comment(commentObj);
                    newComment.save();
                    console.log('save ' + tmpMessage);
                });
            });
    }
});

router.get('/test', (req, res) => {
    Comment.find({}, (err, res) => {
        console.log(res);
    });
});

module.exports = router;