// Kiko, always start like this
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cors = require('cors');
var fileUpload = require('express-fileupload');

var Project = require('./project-model');
var Type = require('./type-model');


//setup database connection
var connectionString = 'mongodb://project-admin:kiko115566@cluster0-shard-00-00-k2abi.mongodb.net:27017,cluster0-shard-00-01-k2abi.mongodb.net:27017,cluster0-shard-00-02-k2abi.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(connectionString,{ useNewUrlParser: true });
var  db = mongoose.connection;
db.once('open', () => console.log('Database connected'));
db.on('error', () => console.log('Database error'));

//setup express server
var app = express();
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(fileUpload()); //26-08-2019
app.use(logger('dev'));

app.use(express.static('public'))  //Kiko, this is to import the images from the public folder.

//setup routes
var router = express.Router();

router.get('/types', (req, res) => {
    Type.find()
    .then((types)=>{
        return res.json(types);
    });
})



router.get('/testing', (req, res) => {
    res.send('<h1>Testing is working</h1>')
  })

router.get('/projects', (req, res) => {
    Project.find()
    .then((projects)=>{
        return res.json(projects);
    });
})
router.get('/projects/:id', (req, res) => {

	Project.findOne({id:req.params.id})
	.then((project) => {
	    return res.json(project);
	});
})

router.post('/projects', (req, res) => {

	var project = new Project();
	project.id = Date.now();
	
	var data = req.body; //get the data out
	Object.assign(project,data);  // same as var newItem ={...item, ...extra}, but this is mongoose 
	
	project.save()
	.then((project) => {
	  	return res.json(project);
	});
});

router.post('/upload', (req, res) => {

	// return req.files;  //test in postman http://localhost:4000/api/upload 26-08-2019

	var files = Object.values(req.files); //native JavaScript feature, convert it to array.

	var uploadedFile = files[0]; //upload file in files array.

	//console.log(uploadFile); //it will show mv: [Function: mv] in terminal. mv means move.
	// uploadFile.mv('public' + 'bla.jpg', callback function)

	var newName = Date.now() + uploadedFile.name; //this is to make sure the name is uniqe

	uploadedFile.mv('public/' + newName,function (){
		res.send(newName); //this means move the file 'bla.jpg' to public
	})

});

router.delete('/projects/:id', (req, res) => {

	Project.deleteOne({ id: req.params.id })
	.then(() => {
		return res.json('deleted');
	});
});

router.put('/projects/:id', (req, res) => {

	Project.findOne({id:req.params.id})
	.then((project) => {
		var data = req.body;
		Object.assign(project,data);
		return project.save()	
	})
	.then((project) => {
		return res.json(project);
	});	

});




app.use('/api', router);


// launch our backend into a port
const apiPort = 4000;
app.listen(apiPort, () => console.log('Listening on port '+apiPort));
