from __future__ import print_function
import login
import re,os,sys,warnings,argparse
from io import StringIO, BytesIO
from time import strftime
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def browse_panel():
	URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL"
	payload = {'ICType':'Panel'}
	r = cusis.session.post(URL, data=payload)
	#print r.text
	return r.status_code


def browse_course(subject, code, term):
	URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL"
	semester_code = term 	#You should find semester code in Cusis system and put it here yourself. (2014-15 sem 1 => 1835)
	payload = {
		#'CLASS_SRCH_WRK2_INSTITUTION$47$' : 'CUHK1',
		'CLASS_SRCH_WRK2_STRM$50$' : semester_code,
		'CLASS_SRCH_WRK2_SSR_EXACT_MATCH1' : 'E',
		'CLASS_SRCH_WRK2_SUBJECT$67$' : subject,
		'CLASS_SRCH_WRK2_CATALOG_NBR$71$' : code,
		'CLASS_SRCH_WRK2_ACAD_CAREER' : 'UG',
		'ICType':'Panel',
		'ICAction':'CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH',
		'CLASS_SRCH_WRK2_SSR_OPEN_ONLY$chk' : 'N',
		'SSR_DUMMY_RECV1$sels$0' : '1'
	}
	r = cusis.session.post(URL,data=payload)
	payload = {

		'ICType':'Panel',
		'ICAction':'#ICSave',
		'SSR_DUMMY_RECV1$sels$0' : '1',
		'PSPUSHBUTTONTBOK': 'OK'
	}
	r = cusis.session.post(URL,data=payload)
	payload = {
		'ICType':'Panel',
		'ICAction': '$ICField106$hviewall$0',
		'SSR_DUMMY_RECV1$sels$0' : '1',
	}
	r = cusis.session.post(URL,data=payload)
	item = set(re.findall(r'DERIVED_CLSRCH_SSR_CLASSNAME_LONG\$[0-9]+', r.text))
	item = sorted(item)
	#print item
	print('[', end='')
	turn = 0
	for i in item:
		payload = {'ICType':'Panel','ICAction': 'CLASS_SRCH_WRK2_SSR_PB_BACK$86$'}
		r = cusis.session.post(URL,data=payload)
		payload = {'ICType':'Panel','ICAction': i}
		r = cusis.session.post(URL,data=payload)
		info = re.findall(r"<span  class='PSEDITBOX_DISPONLY' >([0-9]*?)</span>", r.text)
		name = re.findall(r"<span  class='PALEVEL0SECONDARY' >(.+?)</span>", r.text)
		name = name[0].replace("&nbsp;", "")
		nameList = name.strip().split(' - ')
		courseCode = ''.join(nameList[0].split(' '))
		sectionCode = nameList[1].split(' ')[0]
		if turn != 0:
			print(',', end='')
		print('{"courseName": "' + name + '", "classCapacity": ' + info[1] + ', "enrollTotal": ' + info[3] + ', "availSeats": ' + info[5] + ', "waitListTotal": ' + info[4] + ', "courseCode": "' + courseCode + '", "sectionCode": "' + sectionCode, end='"}')
		turn += 1
	print(']', end='')
	return r.status_code



def main(subject, code, term):
	browse_panel()
	browse_course(subject, code, term)
	#dumplist("a.xls")

if __name__ == '__main__':
	semcode_dict = {'1' : 2000, '2' : 2010, 's' : 2045 }
	semcode = semcode_dict[sys.argv[3]]
	match = re.match(r"([a-z]+)([0-9]+[a-z]*)", sys.argv[4], re.I)
	if match:
		items = match.groups()
		cusis = login.Cusis()
		s = cusis.login(sys.argv[1], sys.argv[2])
		if s:
			main(items[0], items[1], semcode)
		else:
			print("[WARNING] Login Fail")
	sys.stdout.flush()
