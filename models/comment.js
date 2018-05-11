var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    courseCode: String,
    sectionCode: String,
    semester: String,
    time: String,
    text: String,
    author: String,
    rating: {
        type: Number,
        required: true
    },

    voters: [String],
    numVotes: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Comment', commentSchema);