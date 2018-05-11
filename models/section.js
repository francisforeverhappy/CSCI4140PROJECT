var mongoose = require('mongoose');

var sectionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    status: String, 
    courseNumber: Number,
    courseComponent: String,
    courseCode: String,
    sectionCode: String,
    meetingInfo: [{
        daysTime: {
            day: Number,
            timeSlot: {
                start: Number,
                end: Number
            }
        },
        room: String,
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

module.exports = mongoose.model('Section', sectionSchema, 'Section');