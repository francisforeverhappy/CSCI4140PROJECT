var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    courseInfo: {
        id: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    text: String,
    rating: Number,
    sid: String
});

module.exports = mongoose.model('Comment', commentSchema);
