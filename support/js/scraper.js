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

const targetUrl = `https://cusis.cuhk.edu.hk/psc/csprd/EMPLOYEE/HRMS/c/CU_CUR_MENU.CU_TMSR801.GBL?PORTALPARAM_PTCNAV=CU_TMSR801_GBL&amp;EOPP.SCNode=HRMS&amp;EOPP.SCPortal=EMPLOYEE&amp;EOPP.SCName=HCSR_CURRICULUM_MANAGEMENT&amp;EOPP.SCLabel=Curriculum%20Management&amp;EOPP.SCPTfname=HCSR_CURRICULUM_MANAGEMENT&amp;FolderPath=PORTAL_ROOT_OBJECT.HCSR_CURRICULUM_MANAGEMENT.HCSR_SCHEDULE_OF_CLASSES.CU_TMSR801_GBL&amp;IsFolder=false&amp;PortalActualURL=https%3a%2f%2fcusis.cuhk.edu.hk%2fpsc%2fcsprd%2fEMPLOYEE%2fHRMS%2fc%2fCU_CUR_MENU.CU_TMSR801.GBL&amp;PortalContentURL=https%3a%2f%2fcusis.cuhk.edu.hk%2fpsc%2fcsprd%2fEMPLOYEE%2fHRMS%2fc%2fCU_CUR_MENU.CU_TMSR801.GBL&amp;PortalContentProvider=HRMS&amp;PortalCRefLabel=Teaching%20Timetable%20by%20Subj%2fDpt&amp;PortalRegistryName=EMPLOYEE&amp;PortalServletURI=https%3a%2f%2fcusis.cuhk.edu.hk%2fpsp%2fcsprd%2f&amp;PortalURI=https%3a%2f%2fcusis.cuhk.edu.hk%2fpsc%2fcsprd%2f&amp;PortalHostNode=HRMS&amp;NoCrumbs=yes`;
// POST data then scrape the page
req.post({
    url: "https://onepass.cuhk.edu.hk/login/submit.jsp",
    form: { 'userid': '1155076990', 'pwd':'' },
    headers: {
        'User-Agent': 'Super Cool Browser' // optional headers
     }
  }, (err, resp, body) => {
    // load the html into cheerio
    req.get({
        url:targetUrl,
        hearders: {
            'User-Agent': 'Super Cool Browser' // optional headers
        }
    }, (error, res, htmlBody) => {
        if (error) {
            console.log(error.message);
        }
        let $ = cheerio.load(htmlBody);
        let result = $('form[name=win0]').length;
        // let result = $('#CLASS_LIST tbody').find('tr').length;
        console.log(result);
    });
	// do something with the page here	
});

// function scraper() {
//     const options = {
//         uri: 'https://cusis.cuhk.edu.hk/psp/csprd/EMPLOYEE/HRMS/s/WEBLIB_PTPP_SC.HOMEPAGE.FieldFormula.IScript_AppHP?pt_fname=CO_EMPLOYEE_SELF_SERVICE&FolderPath=PORTAL_ROOT_OBJECT.CO_EMPLOYEE_SELF_SERVICE&IsFolder=true',
//         transform: (body) => {
//             return cheerio.load(body);
//         }
//     };
    
//     rp(options)
//         .then(($) => {
//             console.log($);
//         })
//         .catch((err) => {
//             console.log(err.message);
//         });
// }
