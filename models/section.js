var mongoose = require('mongoose');

var sectionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // all the same
    courseInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },

    // courseCode: String, // include the section code
    // courseName: String,
    // sectionCode: String,
    // semester: String,
    // description: String,
    
    // classDetails: {
    status: String, // not same
        // session: String,
    //     units: Number,
    //     career: String,
        // grading: String
    // },
    
    // enrollmentInfo: {
    //     dropConsent: String,
    //     enrollReq: String,
    //     classAttr: String
    // },
    
    // different info
    courseNumber: Number, // unique
    courseComponent: String,
    meetingInfo: [{
        daysTime: {
            day: Number,
            timeSlot: [{
                start: Number,
                end: Number
            }],
        },
        room: String,
        instructor: String, // professor
        meetingDates: {
            startDate: Date,
            endDate: Date
        }
    }],
    classAvail: {
        classCapacity: Number,
        enrollTotal: Number,
        availSeats: Number,
        waitListCapacity: Number,
        waitListTotal: Number,
        updatedTime: Date
    }
});

module.exports = mongoose.model('Section', sectionSchema);