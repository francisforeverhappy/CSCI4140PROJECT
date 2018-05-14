from __future__ import print_function
from collections import Counter
from pymongo import MongoClient
import pymongo
import login
import re,os,sys
from bs4 import BeautifulSoup
from io import StringIO, BytesIO
from time import strftime
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def browse_history():
    URL = "https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES_2.SSS_MY_CRSEHIST.GBL"
    payload = {
        'ICType':'Panel',
    }
    r = cusis.session.post(URL,data=payload)
    raw_l = re.findall(r"<span  class='PSEDITBOX_DISPONLY' >([A-Z]+ [0-9]+)</span>",r.text)
    courhis = [x.replace(" ","") for x in raw_l]
    l = [x.split(" ")[0] for x in raw_l]
    print (l)
    nums = [x.split(" ")[1] for x in raw_l]
    status = int(max(nums)[0])
    if status >= 3:
        status = 3
    print (status)
    counts = Counter(l)
    counts = sorted(counts.items(), key=lambda x: counts.get(x[0]), reverse=True)
    client = MongoClient()
    client = MongoClient('localhost', 27017)
    db = client.csci4140_db
    courses = set()
    for t in list(counts)[0:len(counts)//2]:
        posts = db.Course.find({"courseCode": {'$regex' : t[0] + "[" + str(status) + "-9]" + ".*"}}).sort([("avgRating", pymongo.DESCENDING), ("numRating", pymongo.DESCENDING)])
        for p in posts[0:3]:
            if p['courseCode'] not in courhis:
                courses.add(p['courseCode'])
    print (",".join(courses))
def main():
    browse_history()

if __name__ == '__main__':
    cusis = login.Cusis()
    flag = cusis.login(sys.argv[1], sys.argv[2])
    print(str(flag))
    if flag:
        main()
    sys.stdout.flush()
