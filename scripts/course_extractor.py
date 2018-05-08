import cusiscommon
import re,os,json
from time import strftime

add_info = {}

def search_panel():
    URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/CU_SCR_MENU.CU_TMSR801.GBL"
    payload = {'ICType':'Panel'}
    r = cusis.session.post(URL, data=payload)
    return r.status_code

def search(subject):
    URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/CU_SCR_MENU.CU_TMSR801.GBL"
    semester_code = '2010'  #You should find semester code in Cusis system and put it here yourself. (2014-15 sem 1 => 1835)
    payload = {
        'ICType':'Panel',
        'ICAction':'CU_RC_TMSR801_SSR_PB_CLASS_SRCH',
        'CLASS_SRCH_WRK2_ACAD_CAREER':'UG',
        'CLASS_SRCH_WRK2_STRM$50$':semester_code,
        'CU_RC_TMSR801_SUBJECT':subject.upper()
    }
    r = cusis.session.post(URL,data=payload)
    m = set(re.findall(r"CLASS_NBR\$[0-9]+", r.text))
    return m

def dumpinfo(tofile, info):
    URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/CU_SCR_MENU.CU_TMSR801.GBL"
    for i in info:
        print i
        payload = {'ICType':'Panel','ICAction':i}
        r = cusis.session.post(URL, data=payload)
        m0 = re.findall(r"<span  class='SSSKEYTEXT' >(.+?)</span>", r.text)
        sem =  m0[0].split(' | ')[1]
        m1 = re.findall(r"<span  class='PSLONGEDITBOX' >(.+?)</span>", r.text)
        description = m1[-1]
        regrequire = m1[-3]
        m2 = re.findall(r"<span  class='PSEDITBOX_DISPONLY' >(.+?)</span>", r.text)
        status = m2[1]
        coursenbr = m2[2]
        career = m2[8]
        wltotal = m2[-2]
        wlnow = m2[-4]
        dropcons = "No"
        addcons = "No"
        match = re.search('Add Consent', r.text)
        if match:
            addcons = m2[-7]
        match = re.search('Drop Consent', r.text)
        if match:
            dropcons = m2[-6]
        grading = m2[-9]
        ele = {'semester' : sem, 'status' : status, 'description' : description, 'regrequirement' : regrequire,
        'career' : career, 'wltotal' : wltotal, 'wlnow' : wlnow, 'dropcons' : dropcons, 'addcons' : addcons,
        'grading' : grading}
        print ele
        add_info[int(coursenbr)] = ele
        payload = {'ICType':'Panel','ICAction':'CLASS_SRCH_WRK2_SSR_PB_CLOSE$85$'}
        r = cusis.session.post(URL, data=payload)


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
    info = search(subject)
    dir = 'DumpedCourseList_'+strftime('%Y%m%d')
    if not os.path.exists(dir):
        os.makedirs(dir)
    fullpath = os.path.join('DumpedCourseList_'+strftime('%Y%m%d'),subject+'.xls')
    #dumplist(fullpath)
    dumpinfo(fullpath, info)


def main():
    with open('FacList.txt','r') as f:
        for line in f.readlines():
            subject = line.split()[0]
            print('Dumping',subject,'......')
            dodump(subject)
    with open('info_dict.json', 'w') as f:
        json.dump(add_info, f)

if __name__ == '__main__':
    cusis = cusiscommon.Cusis()
    cusis.login()
    main()
