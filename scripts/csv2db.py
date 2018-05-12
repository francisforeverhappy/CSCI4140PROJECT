from pymongo import MongoClient
import realtime_extractor
import datetime
import os
import json
import glob, re
import pandas as pd

day2num = {
	'TB': -1,
	'Mo': 0,
	'Tu': 1,
	'We': 2,
	'Th': 3,
	'Fr': 4,
	'Sa': 5,
	'Su': 6
}
def period2daytime(date):
	day = day2num[date[0:2]]
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
		"09:15AM" : 2, "10:15AM" : 3,
		"11:15AM" : 4, "12:15PM" : 5,
		"01:15PM" : 6, "02:15PM" : 7,
		"03:15PM" : 8, "04:15PM" : 9,
		"05:15PM" : 10,"06:15PM" : 11,
		"07:15PM" : 12, "08:15PM" : 13,
		"09:15PM" : 14
	}
	try:
		start = start_timeslot_dict[date[3:10]]
		end = end_timeslot_dict[date[13:20]]
		return [day, start, end]
	except Exception:
		return [None, None, None]

def main():
	client = MongoClient()
	client = MongoClient('localhost', 27017)
	client.drop_database('csci4140_db')
	db = client.csci4140_db
	files = glob.glob('./DumpedCourseList_20180512/*.xls')
	with open('info_dict.json') as f:
		add_info = json.load(f)
	for path in files:
		df_list = pd.read_html(path, header =0, flavor = 'bs4')
		dataframe = df_list[0]
		section_id, course_id, section, course, addinforow = None, None, None, None, None
		classcode = 0
		coursenbr = -1

		for index, df in dataframe.iterrows():
			[day, start, end] = period2daytime(df['Period'])

			if str(df['Course Component']).strip() == 'nan':
				section["meetingInfo"].append({
					"daysTime": {
						"day": day,
						"timeSlot": {
							"start" : start,
							"end" : end
						},
					},
					"room" : df['Room'],
					"meetingDates": {
						"startDate": datetime.datetime.strptime(df['Meeting Date'].split(" - ")[0], "%d/%m/%Y"),
						"endDate": datetime.datetime.strptime(df['Meeting Date'].split(" - ")[1], "%d/%m/%Y")
					}
				})
				continue
			if str(df['Class Code']) == 'nan':
				section_id = db.Section.insert_one(section).inserted_id

				courseComponent = section['courseComponent']

				if courseComponent and str(courseComponent) != 'nan':
					if courseComponent in course['componentDict']:
						course['componentDict'][courseComponent].append(section_id)
					else:
						course['componentDict'][courseComponent] = [section_id]

					# if section['courseComponent'] == 'LEC':
					# 	course['lectures'] = section_id
					# elif section['courseComponent'] == 'TUT':
					# 	course['tutorials'].append(section_id)
					# elif section['courseComponent'] == 'LAB':
					# 	course['labs'].append(section_id)

				if str(df['Section Code']) == 'nan':
						df['Section Code'] = None
				elif df['Section Code'] and df['Section Code'] != '' and df['Section Code'][0] == '-':
					df['Section Code'] = df['Section Code'][1:]

				section = {
					"courseCode": classcode,
					"semester": addinforow['semester'],
					"sectionCode": df['Section Code'],
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
							},
							"room" : df['Room'],
							"meetingDates": {
            					"startDate": datetime.datetime.strptime(df['Meeting Date'].split(" - ")[0], "%d/%m/%Y"),
            					"endDate": datetime.datetime.strptime(df['Meeting Date'].split(" - ")[1], "%d/%m/%Y")
        					}
						}
					],
					"classAvail" : {
						"classCapacity": int(df['Quota(s)']),
						"enrollTotal": int(df['Quota(s)']) - int(df['Vacancy']),
						"availSeats": int(df['Vacancy']),
						"waitListCapacity": int(addinforow['wlnow']),
						"waitListTotal": int(addinforow['wltotal']),
						"updatedTime": datetime.datetime.utcnow()
					}
				}
				continue
			coursenbr = str(int(df['Class Nbr']))
			addinforow = add_info[coursenbr]
			if section != None:
				section_id = db.Section.insert_one(section).inserted_id
				courseComponent = section['courseComponent']

				if courseComponent and str(courseComponent) != 'nan':
					if courseComponent in course['componentDict']:
						course['componentDict'][courseComponent].append(section_id)
					else:
						course['componentDict'][courseComponent] = [section_id]

				# if section['courseComponent'] == 'LEC':
				# 	course['lectures'] = section_id
				# elif section['courseComponent'] == 'TUT':
				# 	course['tutorials'].append(section_id)
				# elif section['courseComponent'] == 'LAB':
				# 	course['labs'].append(section_id)

			if course != None:
				course_id = db.Course.insert_one(course).inserted_id
			try:
				classcode = re.match(r"[a-zA-Z]+[0-9]+", df['Class Code']).group(0)
			except Exception as e:
				print(e)
			if df['Section Code'] == '-':
				df['Section Code'] = ''

			df['Teaching Staff'] = ', '.join(df["Teaching Staff"][2:].split(' - '))
			if str(df['Section Code']) == 'nan':
					df['Section Code'] = None
			elif df['Section Code'] and df['Section Code'] != '' and df['Section Code'][0] == '-':
				df['Section Code'] = df['Section Code'][1:]
				print addinforow['regrequirement']
			course = {
				"courseCode": classcode,
				"courseName": df['Course Title'],
				"sectionCode": df['Section Code'],
				"semester": addinforow['semester'],
				"description": addinforow['description'],

				"classDetails": {
					"units": df['Units'],
					"career": addinforow['career'],
					"grading": addinforow['grading']
				},
				"enrollmentInfo" : {
					"addConsent" : addinforow['addcons'],
					"dropConsent" : addinforow['dropcons'],
					"enrollReq" : addinforow['regrequirement'],
					"classAttr" : df['Language']
				},
				"instructor" : df["Teaching Staff"],
				"componentDict": {}
				# "lectures" : None,
				# "tutorials" : [],
				# "labs" : []
			}

			if str(df['Section Code']) == 'nan':
					df['Section Code'] = None
			elif df['Section Code'] and df['Section Code'] != '' and df['Section Code'][0] == '-':
				df['Section Code'] = df['Section Code'][1:]
			section = {
				"courseCode": classcode,
				"semester": addinforow['semester'],
				"sectionCode": df['Section Code'],
				"courseComponent": df['Course Component'],
				"status": addinforow['status'],

				"meetingInfo": [
					{
						"daysTime": {
							"day": day,
							"timeSlot": {
								"start" : start,
								"end" : end
							}
						},
						"room" : df['Room'],
						"meetingDates": {
							"startDate": datetime.datetime.strptime(df['Meeting Date'].split(" - ")[0], "%d/%m/%Y"),
							"endDate": datetime.datetime.strptime(df['Meeting Date'].split(" - ")[1], "%d/%m/%Y")
						}
					}
				],
				"classAvail" : {
					"classCapacity": int(df['Quota(s)']),
					"enrollTotal": int(df['Quota(s)']) - int(df['Vacancy']),
					"availSeats": int(df['Vacancy']),
					"waitListCapacity": int(addinforow['wlnow']),
					"waitListTotal": int(addinforow['wltotal']),
					"updatedTime": datetime.datetime.utcnow()
				}
			}
if __name__ == "__main__":
	main()
