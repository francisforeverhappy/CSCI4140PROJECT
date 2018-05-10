const spawn = require('child_process').spawn,
    rp = require('request-promise'),
    cheerio = require('cheerio'),
    request = require('request');

let pythonProcess = spawn('python', ['../py/login.py', '1155076990', 'zxcv$4321']);
require('ssl-root-cas').inject();

// pythonProcess.stdout.on('data', (data) => {
//     let result = data.toString().trim(); 
//     if (result == 'True') {
//         console.log('login success');
//         scraper();
//     } else {
//         console.log('login fail');
//     }
// });

req = request.defaults({
	jar: true,                 // save cookies to jar
	rejectUnauthorized: false, 
	followAllRedirects: true   // allow redirections
});

const targetUrl = `https://cusis.cuhk.edu.hk/psc/csprd/CUHK/PSFT_HR/c/SA_LEARNER_SERVICES.SSR_SSENRL_CART.GBL?Page=SSR_SSENRL_CART&Action=A&ACAD_CAREER=UG&EMPLID=1155076990&INSTITUTION=CUHK1&STRM=2010`;
// POST data then scrape the page
req.post({
    url: "https://cusis.cuhk.edu.hk/psp/csprd/?cmd=login",
    form: { 'userid': '1155076990', 'pwd':'' },
    headers: {
        'User-Agent': 'Super Cool Browser' // optional headers
     }
  }, (err, resp, body) => {
    // load the html into cheerio
    req.get({
        url:targetUrl,
        headers: {
            'User-Agent': 'Super Cool Browser' // optional headers
        }
    }, (error, res, htmlBody) => {
        if (error) {
            console.log(error.message);
        }
        let $ = cheerio.load(htmlBody);
        console.log($.html())
        console.log($('.PSEDITBOX_DISPONLY').html());
    });
});