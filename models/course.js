var mongoose = require('mongoose');

var courseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    
    courseCode: String,
    courseName: String,
    sectionCode: String,
    semester: String,
    description: String,
    classDetails: {
        // status: String, // different
        session: String,
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
    }]
});

module.exports = mongoose.model('Course', courseSchema);