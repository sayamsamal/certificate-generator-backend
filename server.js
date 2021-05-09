const express = require('express');
const app = express();
const multer = require('multer')
const cors = require('cors');
const spawn = require("child_process").spawn;
var path = require('path')
let {PythonShell} = require('python-shell')

const port = process.env.PORT || 3000

app.use(cors())

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'cert_files')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + path.extname(file.originalname))
  }
})

const selectedFields = [
    {name: 'certificateImage' , maxCount: 1},
    {name: 'certificateFont' , maxCount: 1},
    {name: 'certificateCSV' , maxCount: 1}
]

var upload = multer({ storage: storage }).fields(selectedFields)

app.post('/upload', function(req, res) {
     
    upload(req, res, function (err) {
           if (err instanceof multer.MulterError) {
               return res.status(500).json(err)
           } else if (err) {
               return res.status(500).json(err)
           }
      return res.status(200).send(req.file)

    })
});

app.post('/python', multer().none(),function(req, res) {
    let params = req.body
    let imageExtension = path.extname(params.imageName)
    let options = {
        mode: 'text',
        pythonOptions: ['-u'],
        args: [params.email, params.password, params.xCoordinate, params.yCoordinate, params.emailSubject, params.emailBody, imageExtension]
    }
    let pyshell = new PythonShell('main.py', options);

    pyshell.on('message', function (message) {
        console.log(message)
    });

    pyshell.end(function (err,code,signal) {
        if (err) throw err;
        res.send(signal)
        console.log('The exit code was: ' + code);
        console.log('The exit signal was: ' + signal);
        console.log('finished');
      });
})

app.listen(port, function() {

    console.log(`App running on port ${port}`);

});
