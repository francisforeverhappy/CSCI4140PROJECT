const timeMap = {
    1: "08",
    2: "09",
    3: "10",
    4: "11",
    5: "12",
    6: "13",
    7: "14",
    8: "15",
    9: "16",
    10: "17",
    11: "18",
    12: "19",
    13: "20",
    14: "21"
}

function getNextDate(day){
    var oldDate = new Date(day);
    var nextDate = new Date(day);
    nextDate.setDate(oldDate.getDate()+1);
    return nextDate;
}

function exportToCal(info){
    var cal = ics();
    for(var id in info){
        let course = info[id].course;
        let select = info[id].select;
        let title = course.courseCode + course.sectionCode;
        let name = course.courseName;

        if(course.lectures != null){
            course.lectures.meetingInfo.forEach(function(record){
                let starttime = record.meetingDates.startDate.slice(0,11) + timeMap[record.daysTime.timeSlot.start] + ":30:00";
                let endtime = record.meetingDates.startDate.slice(0,11) + timeMap[record.daysTime.timeSlot.end] + ":15:00";
                let rrule = {
                    "freq" : "WEEKLY",
                    "until" : getNextDate(record.meetingDates.endDate)
                };
                cal.addEvent(title, name, record.room, starttime, endtime, rrule);
            });
        }

        if(course.tutorials.length > 0){
            for(var i in course.tutorials[select.TUT].meetingInfo){
                let record = course.tutorials[select.TUT].meetingInfo[i][0];
                let starttime = record.meetingDates.startDate.slice(0,11) + timeMap[record.daysTime.timeSlot.start] + ":30:00";
                let endtime = record.meetingDates.startDate.slice(0,11) + timeMap[record.daysTime.timeSlot.end] + ":15:00";
                let rrule = {
                    freq : "WEEKLY",
                    until : getNextDate(record.meetingDates.endDate)
                };
                cal.addEvent(title, name, record.room, starttime, endtime, rrule);
            };
        }

        if(course.labs.length > 0){
            course.labs[select.LAB].meetingInfo.forEach(function(record){
                let starttime = record.meetingDates.startDate.slice(0,11) + timeMap[record.daysTime.timeSlot.start] + ":30:00";
                let endtime = record.meetingDates.startDate.slice(0,11) + timeMap[record.daysTime.timeSlot.end] + ":15:00";
                let rrule = {
                    freq : "WEEKLY",
                    until : getNextDate(record.meetingDates.endDate)
                };
                cal.addEvent(title, name, record.room, starttime, endtime, rrule);
            });
        }
    }
    cal.download("CUTE Timetable");
}