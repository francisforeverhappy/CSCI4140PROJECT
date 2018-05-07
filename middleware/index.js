const spawn = require('child_process').spawn;

module.exports = {
    checkLogin: (req, res, next) => {
        if ('sid' in req.session) {
            console.log('isLoggedIn is ture');
            req.isLoggedIn = true;
        } 
        else {
            console.log('isLoggedIn is false');
            req.isLoggedIn = false;
        }
        return next();        
    },
    import: (sid, password) => {
        let pythonProcess = spawn('python', ['support/py/import.py', sid, password]);
        pythonProcess.stdout.on('data', (data) => {
            // data should be an array
            return data;
        });
    }
}

