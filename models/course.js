var mongoose = require('mongoose');

var courseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    
    courseCode: String,
    courseName: String,
    sectionCode: String,
    semester: String,
    description: String,
    instructor: String, // professor    
    classDetails: {
        // status: String, // different
        units: Number,
        career: String,
        grading: String
    },
    
    enrollmentInfo: {
        dropConsent: String,
        enrollReq: String,
        classAttr: String
    },

    lectures: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    },

    tutorials: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    }],

    labs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    }],

    avgRating: {
        type: Number,
        default: null
    },

    numRating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Course', courseSchema, 'Course');