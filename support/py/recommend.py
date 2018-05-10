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
    URL = "https://cusis.cuhk.edu.hk/psp/csprd/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES_2.SSS_MY_CRSEHIST.GBL"
    payload = {
        'ICType':'Panel',
    }
    r = cusis.session.post(URL,data=payload)
    l = re.findall(r"<span  class='PSEDITBOX_DISPONLY' >([A-Z]+ [0-9]+)</span>",r.text)
    l = [x.split(" ")[0] for x in l]
    l = ["CSCI","UGEA"]
    counts = Counter(l).items()
    client = MongoClient()
    client = MongoClient('localhost', 27017)
    db = client.csci4140_db
    for t in counts[0:len(counts)//2]:
        posts = db.Course.find({"courseCode": {'$regex' : t[0]+".*"}}).sort([("avgRating", pymongo.DESCENDING), ("numRating", pymongo.DESCENDING)])
        for p in posts[0:3]:
            print (p['courseCode'])

def main():
    browse_history()

if __name__ == '__main__':
    cusis = login.Cusis()
    cusis.login(sys.argv[1], sys.argv[2])
    main()
    sys.stdout.flush()
