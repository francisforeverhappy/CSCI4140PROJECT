const request = require('request');
const querystring = require('querystring');
const spawn = require('child_process').spawn;

module.exports = {
    checkLogin: function (sid, password) {
        var pythonProcess = spawn('python', ['middleware/login.py', sid, password]);
        pythonProcess.stdout.on('data', (data) => {
            var result = data.toString().trim(); 
            if (result == 'True') {
                console.log('login success');
                return true;
            } else {
                console.log('login fail');
                return false;
            }
        });
    },
    import: function (sid, password) {
        var pythonProcess = spawn('python', ['middleware/import.py', sid, password]);
        pythonProcess.stdout.on('data', (data) => {
            return data;
        });
    }
}