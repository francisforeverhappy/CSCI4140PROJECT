from __future__ import print_function
import login
import re,os,sys
from bs4 import BeautifulSoup
from io import StringIO, BytesIO
from time import strftime
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def browse_history(coursecode):
    URL = "https://cusis.cuhk.edu.hk/psp/csprd/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES_2.SSS_MY_CRSEHIST.GBL"
    payload = {
        'ICType':'Panel',
    }
    r = cusis.session.post(URL,data=payload, allow_redirects=False)
    l = re.findall(r"<span  class='PSEDITBOX_DISPONLY' >([A-Z]+ [0-9]+)</span>",r.text)
    if coursecode in l:
        print (True)
    else:
        print (False)

def main(coursecode):
    browse_history(coursecode)

if __name__ == '__main__':
    cusis = login.Cusis()
    cusis.login(sys.argv[1], sys.argv[2])
    main(sys.argv[3])
    sys.stdout.flush()