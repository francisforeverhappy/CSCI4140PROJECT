const spawn = require('child_process').spawn;

module.exports = {
    asyncMiddleware:  fn => (req, res, next) => {
            Promise.resolve(fn(req, res, next))
            .catch(next);
    },
    checkLogin: (req, res, next) => {
        if ('sid' in req.session) {
            console.log('user has logged in is ture');
            return next();
        } 
        console.log('user has NOT logged in');
        return res.send({success: false});        
    },
    import: (sid, password) => {
        let pythonProcess = spawn('python', ['support/py/import.py', sid, password]);
        pythonProcess.stdout.on('data', (data) => {
            // data should be an array
            return data;
        });
    }
}

