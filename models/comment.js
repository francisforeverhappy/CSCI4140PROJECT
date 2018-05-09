var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    courseInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    courseCode: String,
    text: String,
    rating: Number,
    sid: String
});

module.exports = mongoose.model('Comment', commentSchema);
