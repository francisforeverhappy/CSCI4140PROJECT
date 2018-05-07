import cusiscommon
import re,os
from time import strftime


def search_panel():
	URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/CU_SCR_MENU.CU_TMSR801.GBL"
	payload = {'ICType':'Panel'}
	r = cusis.session.post(URL, data=payload)
	return r.status_code

def search(subject):
	URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/CU_SCR_MENU.CU_TMSR801.GBL"
	semester_code = '1845' 	#You should find semester code in Cusis system and put it here yourself. (2014-15 sem 1 => 1835)
	payload = {
		'ICType':'Panel',
		'ICAction':'CU_RC_TMSR801_SSR_PB_CLASS_SRCH',
		'CLASS_SRCH_WRK2_ACAD_CAREER':'UG',
		'CLASS_SRCH_WRK2_STRM$50$':semester_code,
		'CU_RC_TMSR801_SUBJECT':subject.upper()
	}
	r = cusis.session.post(URL,data=payload)
	return r.status_code

def dumplist(tofile):
	URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/CU_SCR_MENU.CU_TMSR801.GBL"
	payload = {'ICType':'Panel','ICAction':'CLASS_LIST$hexcel$0'}
	r = cusis.session.post(URL,data=payload)
	m = re.search(r"window\.open\('(.+?)'",r.text)
	if m:
		redirectURL = m.group(1)
	else:
		print('[Err] The redirect URL could not be found in html code.')
		exit(0)
	r = cusis.session.get(redirectURL)
	if r.ok:
		with open(tofile,'wb') as f:
			for chunk in r.iter_content():
				f.write(chunk)
			print('Course lists are in', tofile, 'now.')
	else:
		print('[Err] Download link error.')

def dodump(subject):
	search_panel()
	search(subject)
	dir = 'DumpedCourseList_'+strftime('%Y%m%d')
	if not os.path.exists(dir):
		os.makedirs(dir)
	fullpath = os.path.join('DumpedCourseList_'+strftime('%Y%m%d'),subject+'.xls')
	dumplist(fullpath)

def main():
	with open('FacList.txt','r') as f:
		for line in f.readlines():
			subject = line.split()[0]
			print('Dumping',subject,'......')
			dodump(subject)

if __name__ == '__main__':
	cusis = cusiscommon.Cusis()
	cusis.login()
	main()
