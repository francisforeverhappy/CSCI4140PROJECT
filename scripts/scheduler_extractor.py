from __future__ import print_function
import cusiscommon
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
    return r.status_code


def browse_scheduler():
    URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL"
    payload = {
        'ICType':'Panel',
        'ICAction':'DERIVED_SSS_SCT_SSR_PB_GO',
        'SSR_DUMMY_RECV1$sels$0' : '0'
    }
    r = cusis.session.post(URL,data=payload)
    #print r.text
    return r.status_code

def printlist():
    URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL"
    payload = {'ICType':'Panel','ICAction':'DERIVED_REGFRM1_SA_LINK_PRINTER'}
    r = cusis.session.post(URL,data=payload)
    course_info = re.findall(r"<table cellspacing='0' (.+?)</table>", r.text, re.DOTALL)
    course_name = re.split(r"<td class='PAGROUPDIVIDER' align='left'>(.+?)</td>", r.text)
    i = 0
    new_entry = True
    code_list = []
    course_name = course_name[1:]
    course_num = len(course_name)
    print("{", end='')
    first = True
    for i in range(0, course_num):
        if i % 2 == 0: 
            if first:
                first = False
            else:
                print(',', end='')
            # print("{", end='')
            courseName = ''.join(course_name[i].split(' ')[0:2])
            print('"' + courseName, end='":')
            continue
        print("{", end='')
        course_info = re.findall(r"<table cellspacing='0' (.+?)</table>", course_name[i], re.DOTALL)

        l = re.findall(r"(?:<span  class=.+?>(.+?)</span>|<td align='CENTER'  class='PSLEVEL3GRIDROW' >(.+?)</td>)", course_info[1], re.DOTALL)
        flat_list = [item for sublist in l for item in sublist]
        item = [x for x in filter(None, flat_list)]
        # print(item)
        firstTime = True
        for i in range(len(item)//7):
            if item[7*i] != "&nbsp;":
                if not firstTime: 
                    print(',', end='')
                else:
                    firstTime = False
                component = item[7*i+2]
                section = item[7*i+1][38:-8][1:]
                print('"' + component, end='":')
                print('"' + section, end='"')
        print('}', end='')
    print('}', end='')

    # print(', '.join(course_name))
    # print (','.join(code_list))


def dumplist(tofile):
    URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL"
    payload = {'ICType':'Panel','ICAction':'DERIVED_REGFRM1_SA_LINK_PRINTER'}
    r = cusis.session.post(URL,data=payload)
    course_info = re.findall(r"<table cellspacing='0' (.+?)</table>", r.text, re.DOTALL)
    course_name = re.findall(r"<td class='PAGROUPDIVIDER' align='left'>(.+?)</td>", r.text)
    course_num = len(course_name)
    with open(tofile,'wb') as f:
        f.write('''
<html dir='ltr' lang='en'>
<!-- Copyright (c) 2000, 2007, Oracle. All rights reserved. -->
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><body><table border='1' cellpadding='3' cellspacing='0'>
<tr>
<th>Course Name</th><th>Status</th><th>Units</th><th>thGrading</th>
<th>Class Nbr</th><th>Section</th>
<th>Component</th><th>Days & Times</th>
<th>Room</th><th>Instructor</th>
<th>Start/End Date</th>
</tr>
''')
        i = 0
        new_entry = True
        for entry in course_info:
            l = re.findall(r"(?:<span  class=.+?>(.+?)</span>|<td align='CENTER'  class='PSLEVEL3GRIDROW' >(.+?)</td>)", entry, re.DOTALL)
            flat_list = [item for sublist in l for item in sublist]
            item = filter(None, flat_list)
            if len(item) == 4:
                new_entry = True
                f.write("<tr>\n")
                f.write("<td>" + course_name[i] + "</td>\n")
                i += 1
                for col in item[0:3]:
                    if col == "&nbsp;":
                        col = ""
                    f.write("<td>" + col + "</td>\n")
            else:
                for i in range(len(item)/7):
                    if i != 0:
                        f.write("<tr>\n")
                        for j in range(4):
                            f.write("<td>""</td>\n")
                    for col in item[7*i : 7*(i+1)]:
                        if col == "&nbsp;":
                            col = ""
                        f.write("<td>" + col + "</td>\n")


    # with open(tofile,'wb') as f:

    #   for chunk in r.iter_content():
    #       f.write(chunk)
    #   print 'Course lists are in', tofile, 'now.'
    # else:
    #   print '[Err] The redirect URL could not be found in html code.'
    #   exit(0)
    # r = cusis.session.get(redirectURL)
    # if r.ok:
    #   with open(tofile,'wb') as f:
    #       for chunk in r.iter_content():
    #           f.write(chunk)
    #       print 'Course lists are in', tofile, 'now.'
    # else:
    #   print '[Err] Download link error.'

    # if r.ok:
    #   with open(tofile,'wb') as f:
    #       for chunk in r.iter_content():
    #           f.write(chunk)
    #       print 'Course lists are in', tofile, 'now.'
    # else:
    #   print '[Err] Download link error.'


def main(cmd):
    browse_panel()
    browse_scheduler()
    if cmd == "-d":
        dumplist("a.xls")
    elif cmd == "-p":
        printlist()
    else:
        print ("Usage: ./scheduler_extractor -d(dump to excel)/-p(print list)")
if __name__ == '__main__':
    cusis = cusiscommon.Cusis()
    cusis.login()
    if len(sys.argv) == 2:
        main(sys.argv[1])
