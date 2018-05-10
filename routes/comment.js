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
router.post('/create', middleware.asyncMiddleware(async (req, res) => {
    console.log('get /comment/create')
    let courseId = req.body.courseId,
        text = req.body.text,
        rating = req.body.rating,
        sid = '1155076990';
    console.log(rating);
    console.log(text);
    if (!rating) {
        console.log('rating is required');
        return res.send({success: false, error: "rating is null"});
    }
    let course = await Course.findById(courseId);
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
        rating: rating, author: sid
    });

    newComment.save();

    Course.find({courseCode: course.courseCode, semester: course.semester}, (err, courses) => {
        let newNumRating = courses[0].numRating + 1;
        let newAvgRating = (courses[0].avgRating * courses[0].numRating + rating) / newNumRating;
        console.log(course);
        courses.forEach((course) => {
            course.numRating = newNumRating;
            course.avgRating = newAvgRating;
            course.save()
        });
        console.log('success');
        res.redirect('back');
    });
}));

router.post('/edit', middleware.checkLogin, (req, res) => {
    let commentId = req.body.key,
        text = req.body.text,
        rating = req.body.rating;
    
    Comment.findByIdAndUpdate(commentId, {time: new Date().toISOString(), text: text, rating: rating}, {new: true}, (err, doc, res) => {
        if (err) {
            console.log(err.message);
            return res.send({success: false});
        }
        console.log(doc);
    });

    Course.find({courseCode: course.courseCode, semester: course.semester}, (err, courses) => {
        let newNumRating = courses[0].numRating + 1;
        let newAvgRating = (courses[0].avgRating * courses[0].numRating + rating) / newNumRating;
        courses.forEach((course) => {
            course.numRating = newNumRating;
            course.avgRating = newAvgRating;
            course.save();
        });
        res.redirect('back');
    });
});

router.post('/delete', middleware.checkLogin, (req, res) => {
    let commentId = req.body.key;
    Comment.findByIdAndRemove(commentId, (err, res) => {
        if (err) {
            console.log(err.message);
            return res.send({success: false});
        }
        console.log(res);
        return res.send({success: true});
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