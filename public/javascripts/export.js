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

        for(var type in course.componentDict){
            let component = course.componentDict[type][select[type]];
            for(var i in component.meetingInfo){
                let record = component.meetingInfo[i][0];
                let starttime = record.meetingDates.startDate.slice(0,11) + timeMap[record.daysTime.timeSlot.start] + ":30:00";
                let endtime = record.meetingDates.startDate.slice(0,11) + timeMap[record.daysTime.timeSlot.end] + ":15:00";
                let rrule = {
                    "freq" : "WEEKLY",
                    "until" : getNextDate(record.meetingDates.endDate)
                };
                cal.addEvent(title, name, record.room, starttime, endtime, rrule);
            }
        }
    }

    // console.log(cal.calendar());
    cal.download("CUTE Timetable");
}