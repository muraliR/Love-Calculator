var express = require('express');
var app = express();
var expressHandlebars  = require('express-handlebars');
var request = require('request');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var fs = require('fs');

//AWS.config.region = 'Singapore';

// For dev purposes only
//AWS.config.update({ accessKeyId: 'key', secretAccessKey: 'secret' });


app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: false,
    verify: function (req, res, buf, encoding) {
        req.rawBody = buf;
    }
}));


app.get('/', function(req, res) {
	res.render('home');
});

app.post('/logo-upload', function(req, res) {
	var base64Data = new Buffer(req.rawBody).toString('base64');

	randomString = Math.random().toString(36).substring(7);

	var fileName = randomString + ".png";

	var filePath = "/home/ubuntu/Downloads/" + fileName;

	fs.writeFile(filePath, base64Data, 'base64', function(err) {

	  	if(!err){
	  		// Read in the file, convert it to base64, store to S3
			// var fileStream = fs.createReadStream('/home/ubuntu/Downloads/downloaded.png');
			// fileStream.on('error', function (err) {
		 //  		if (err) { throw err; }
			// });  
			// fileStream.on('open', function () {
		 //  		var s3 = new AWS.S3();
		 //  		s3.putObject({
			//     	Bucket: 'apps-store',
			//     	Key: 'logo',
			//     	Body: fileStream
			//   	}, function (err) {
			//   		/*console.log(err);*/
			//     	if (err) { throw err; }
			//   	});
			// });


			if(fileExists(filePath)){
				var s3bucket = new AWS.S3({params: {Bucket: 'apps-store'}});
				var fileStream = fs.createReadStream(filePath);

				s3bucket.createBucket(function() {
				  	var params = {Key: fileName , Body: fileStream};
				  	s3bucket.upload(params, function(err, data) {
				    	if (err) {
				      		res.status(200).json({ success : false, message : 'Invalid File' });
				    	} else {
				    		console.log("Uploaded Successfully");
				    		fs.unlinkSync(filePath);
				      		var s3FilePath = "https://s3-ap-southeast-1.amazonaws.com/apps-store/" + fileName;
				      		res.status(200).json({ success : true, s3FilePath : s3FilePath });
				    	}
				  	});
				});
			} else {
				res.status(200).json({ success : false, message : 'Invalid File' });
			}
	  	}
	});
	
});

app.get('/calculate', function(req, res) {

	console.log(req.query);

	var fname = req.query["male_name"];

	var sname = req.query["female_name"];

	var url = "https://love-calculator.p.mashape.com/getPercentage?fname="+fname+"&sname=" + sname;

	request({
	    headers: {
	      'X-Mashape-Key': 'uk8fe4AMzImshwEBzscxUWeMvf6tp10iRh3jsnapLBOAwOZePZ',
	      'Accept' : 'application/json'
	    },
	    uri: url,
	    method: 'GET'
	}, function (err, apiRes, body) {
	    if(err){
	    	res.status(500).json({ success : false, message : 'Something went wrong!! Please try again later!!' });
	    }
	    response_body = JSON.parse(apiRes.body);
	    response_data = { match : response_body };
	    //then requset for flames as well
	    request.post({
	    	url:'http://everydaycalculation.com/love-flame.php?ajax=1', 
	    	form: {i:fname, u:sname}
	    }, function(err,httpResponse,body){
	    	if(err){
	    		res.status(500).json({ success : false, message : 'Something went wrong!! Please try again later!!' });
	    	}

	    	response_data["flames"] = body;
	     	res.status(200).json({ success : true, result_data: response_data });
	 	})

	});
});

app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.listen(process.env.PORT || 5007, function () {
	console.log("Listening on port 5007...");
});


function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch (err) {
        return false;
    }
}