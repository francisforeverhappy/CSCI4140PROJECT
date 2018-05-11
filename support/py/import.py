from __future__ import print_function
import login
import re,os,sys
from bs4 import BeautifulSoup
from io import StringIO, BytesIO
from time import strftime
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def browse_panel():
    URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL"
    payload = {'ICType':'Panel'}
    r = cusis.session.post(URL, data=payload)
    texts = r.text.split("2017-18 Term 2")
    l = re.findall("radio", texts[0])
    index = len(l) - 1

    return index


def browse_scheduler(index):
    URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL"
    payload = {
        'ICType':'Panel',
        'ICAction':'DERIVED_SSS_SCT_SSR_PB_GO',
        'SSR_DUMMY_RECV1$sels$0' : str(index)
    }
    r = cusis.session.post(URL,data=payload)
    #print r.text
    return r.status_code

componentDir = {
    'Lecture': 'LEC',
    'Tutorial': 'TUT',
    'Laboratory': 'LAB',
    'Assembly': 'ASB',
    'Classwork': 'CLW',
    'Debate': 'NAN',
    'Discussion': 'DIS',
    'Exercise': 'EXR',
    'Field': 'FLD',
    'Independent Study': 'IND',
    'Others': 'OTH', 
    'Practicum': 'PRA',
    'Project': 'PRJ',
    'Seminar': 'SEM',
    'Studio': 'STD',
    'Thesis Monitoring Course': 'TMC',
    'Web-enhanced': 'WBL',
    'Workshop': 'WKS'
}

# DERIVED_SSS_SCT_SSR_PB_GO
def printlist():
    URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL?STRM=2010"
    payload = {'ICType':'Panel','ICAction':'DERIVED_REGFRM1_SA_LINK_PRINTER'}
    r = cusis.session.post(URL,data=payload)
    course_info = re.findall(r"<table cellspacing='0' (.+?)</table>", r.text, re.DOTALL)
    course_name = re.split(r"<td class='PAGROUPDIVIDER' align='left'>(.+?)</td>", r.text)
    i = 0
    new_entry = True
    code_list = []
    course_name = course_name[1:]
    course_num = len(course_name)
    print("[", end='')
    first = True
    for i in range(0, course_num):
        if first:
            first = False
        else:
            print(',', end='')
        # print("{", end='')
        if i % 2 == 0:
            print("{", end='')
            courseCode = ''.join(course_name[i].split(' ')[0:2])
            print('"courseCode": "' + courseCode, end='"')
            continue
        course_info = re.findall(r"<table cellspacing='0' (.+?)</table>", course_name[i], re.DOTALL)
        l = re.findall(r"(?:<span  class=.+?>(.+?)</span>|<td align='CENTER'  class='PSLEVEL3GRIDROW' >(.+?)</td>)", course_info[1], re.DOTALL)
        flat_list = [item for sublist in l for item in sublist]
        item = [x for x in filter(None, flat_list)]
        # print(item)
        firstTime = True
        print('"info":[', end='')
        for i in range(len(item)//7):
            if item[7*i] != "&nbsp;":
                if not firstTime:
                    print(',', end='')
                else:
                    firstTime = False
                component = item[7*i+2]
                if component in componentDir:
                    component = componentDir[component]
                section = item[7*i+1][38:-8]
                if section and section != '' and section[0] == '-':
                    section = section[1:]
                print('{"courseComponent":"' + component, end='",')
                print('"sectionCode":"' + section, end='"}')
        print(']}', end='')
    print(']', end='')

def main():
    index = browse_panel()
    browse_scheduler(index)
    printlist()

if __name__ == '__main__':
    cusis = login.Cusis()
    cusis.login(sys.argv[1], sys.argv[2])
    main()
    sys.stdout.flush()
