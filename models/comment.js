var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    courseCode: String,
    semester: String,
    time: String,
    text: String,
    author: String,
    rating: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Comment', commentSchema);