from pymongo import MongoClient
import datetime
import os
import glob
import pandas as pd

def period2daytime(date):
	day = date[0:2]
	start_timeslot_dict = {
		"08:30AM" : 1, "09:30AM" : 2,
		"10:30AM" : 3, "11:30AM" : 4,
		"12:30PM" : 5, "01:30PM" : 6,
		"02:30PM" : 7, "03:30PM" : 8,
		"04:30PM" : 9, "05:30PM" : 10,
		"06:30PM" : 11, "07:30PM" : 12,
		"08:30PM" : 13
	}
	end_timeslot_dict = {
		"09:15AM" : 1, "10:15AM" : 2,
		"11:15AM" : 3, "12:15PM" : 4,
		"01:15PM" : 5, "02:15PM" : 6,
		"03:15PM" : 7, "04:15PM" : 8,
		"05:15PM" : 9,"06:15PM" : 10,
		"07:15PM" : 11, "08:15PM" : 12,
		"09:15PM" : 13
	}
	start = start_timeslot_dict[date[3:10]]
	end = end_timeslot_dict[date[13:20]]
	return [day, start, end]

def main():
	client = MongoClient()
	client = MongoClient('localhost', 27017)
	db = client.csci4140_db
	files = glob.glob('./DumpedCourseList_20180506/*.xls')
	for path in files:
		df_list = pd.read_html(path, header =0, flavor = 'bs4')
		dataframe = df_list[0]
		section_id, course_id, section, course  = None
		for index, df in dataframe.iterrows():
			[day, start, end] = period2daytime(df['Period'])
			if df['Course Component'] == '':
				section["meetinInfo"].append({
					"daysTime": {
						"day": day,
						"timeSlot": {
							"start" : start,
							"end" : end
						}
					}
				})
				continue
			if df['Class Code'] == '':
				section_id = db.Section.insert_one(section).inserted_id
				if section['courseComponent'] == 'LEC':
					course['lectures'] = {"$type" : section_id, "$ref" : "Section"}
				elif section['courseComponent'] == 'TUT':
					course['tutorials'].append({"$type" : section_id, "$ref" : "Section"})
				elif section['courseComponent'] == 'LAB':
					course['lectures'].append({"$type" : section_id, "$ref" : "Section"})
				section = {
					"courseCode": df['Class Code'],
					"courseComponent": df['Course Component'],
					"status": "open",
					"meetingInfo": [
						{
							"daysTime": {
								"day": day,
								"timeSlot": {
									"start" : start,
									"end" : end
								}
							}
						}
					],
					"classAvail" : {
						"classCapacity": int(df['Quota(s)']),
						"enrollTotal": int(df['Quota(s)']) - int(df['Vacancy']),
						"availSeats": int(df['Vacancy']),
						"waitListCapacity": 99,
						"waitListTotal": 999,
						"updatedTime": datetime.datetime.utcnow()
					}
				}
				continue
			if section != None:
				section_id = db.Section.insert_one(section).inserted_id
				if section['courseComponent'] == 'LEC':
					course['lectures'] = {"$type" : section_id, "$ref" : "Section"}
				elif section['courseComponent'] == 'TUT':
					course['tutorials'].append({"$type" : section_id, "$ref" : "Section"})
				elif section['courseComponent'] == 'LAB':
					course['lectures'].append({"$type" : section_id, "$ref" : "Section"})
			if course != None:
				course_id = db.Course.insert_one(course).inserted_id

			course = {
				"courseCode": df['Class Code'],
				"courseName": df['Course Title'] ,
				"sectionCode": df['Section Code'],
				"semester": "",
				"description": "",

				"classDetails": {
					"session": "",
					"units": df['units'],
					"career": "Undergraduate",
					"grading": "graded"
				},
				"enrollmentInfo" : {
					"dropConsent" : df['Drop Consent'] ,
					"enrollReq" : df['Add Consent'],
					"classAttr" : ""
				},
				"lectures" : None,
				"tutorials" : [],
				"labs" : []
			}
			section = {
				"courseCode": df['Class Code'],
				"courseComponent": df['Course Component'],
				"status": "open",

				"meetingInfo": [
					{
						"daysTime": {
							"day": day,
							"timeSlot": {
								"start" : start,
								"end" : end
							}
						}
					}
				],
				"classAvail" : {
					"classCapacity": int(df['Quota(s)']),
					"enrollTotal": int(df['Quota(s)']) - int(df['Vacancy']),
					"availSeats": int(df['Vacancy']),
					"waitListCapacity": 99,
					"waitListTotal": 999,
					"updatedTime": datetime.datetime.utcnow()
				}
			}
if __name__ == "__main__":
	main()
