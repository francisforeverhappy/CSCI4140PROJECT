const spawn = require('child_process').spawn;

module.exports = {
    checkLogin: (req, res, next) => {
        if ('sid' in req.session) {
            console.log('have already logined');
            return next();
        } 
        console.log('not login');
        res.redirect('/login');
    },
    import: (sid, password) => {
        let pythonProcess = spawn('python', ['support/py/import.py', sid, password]);
        pythonProcess.stdout.on('data', (data) => {
            // data should be an array
            return data;
        });
    }
}

