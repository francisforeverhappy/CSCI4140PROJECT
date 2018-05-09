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
router.get('/', middleware.checkLogin, middleware.asyncMiddleware(async (req, res) => {
    let comments = await Comment.find({sid: req.session.sid});
    res.render('comment', {sid: req.session.sid, comments: comments});
}));

router.post('/create', middleware.checkLogin, (req, res) => {
    let courseCode = req.body.courseCode,
        text = req.body.text,
        rating = req.body.rating,
        sid = req.session.sid;
    let newComment = new Comment({courseCode: courseCode, text: text, rating: rating, sid: sid});
    newComment.save((err, result) => {
        console.log(result);
        return res.send({success: true});    
    });
});

router.post('/edit', middleware.checkLogin, (req, res) => {
    let commentId = req.body.key,
        text = req.body.text,
        rating = req.body.rating;
    Comment.findByIdAndUpdate(commentId, {text: text, rating: rating}, {new: true}, (err, doc, res) => {
        if (err) {
            console.log(err.message);
            res.send({success: false});
        }
        console.log(doc);
        return res.send({success: true});
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

module.exports = router;