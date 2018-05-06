var mongoose = require('mongoose');

var sessionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    
    courseCode: String,
    courseName: String,
    sectionCode: String,
    semester: String,
    description: String,
    
    classDetails: {
        status: String,
        session: String,
        units: Number,
        career: String,
        grading: String,
    },
    
    enrollmentInfo: {
        dropConsent: String,
        enrollReq: String,
        classAttr: String
    },
    
    lecInfo: [{
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
    }],
    
    tutInfo: [{
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
    }],
    
    labInfo: [{
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
    }]
});

module.exports = mongoose.model('Session', sessionSchema);