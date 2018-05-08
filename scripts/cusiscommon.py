import requests

class Cusis:

	useragent = {'User-Agent':'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36'}

	def __init__(self):
		self.login_status = False
		self.session = requests.Session()

	def login(self):
		"""Login into cusis, return True if successful."""

		URL = 'https://cusis.cuhk.edu.hk/psp/csprd/?cmd=login'
		payload = {'userid':'1155076990','pwd':''}

		self.session.headers.update(self.useragent)
		r = self.session.post(URL, data=payload, allow_redirects=False, verify=False)

		if 'tab=DEFAULT' in r.text:
			self.login_status = True
			return True
		else:
			return False
	
	def logout(self):
		"""Logout, no return."""

		URL = 'https://cusis.cuhk.edu.hk/psp/csprd/EMPLOYEE/HRMS/?cmd=logout'

		if self.login_status == False:
			pass		# print '[Warning] Please login before calling logout function.'
		else:
			self.session.get(URL)

	def logincheck(self):
		"""Check login session expired or not. Return False if expired, True if not"""

		URL = "https://cusis.cuhk.edu.hk/psp/csprd/EMPLOYEE/HRMS/h/?tab=DEFAULT"

		r = self.session.get(URL, allow_redirects=False)
		if r.status_code == 200:
			self.login_status = True
			# print 'login sucessfully'
			return True
		else:
			self.login_status = False
			# print 'login fails'
			return False

