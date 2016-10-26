var express = require('express');
var app = express();
var expressHandlebars  = require('express-handlebars');
var request = require('request');

app.get('/', function(req, res) {
	res.render('home');
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

