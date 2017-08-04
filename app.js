const express = require('express');
const bodyParser = require('body-parser');
var fs = require('fs');
const vacant = 'vacant';
const occupied = 'occupied';
const actionSetStatus = 'setStatus';

const restService = express();
restService.use(bodyParser.json());


restService.post('/webhook', function(req,res) {
	try {		
		var speech = 'Please,  type \'o\' or \'v\' if you would like to change status';
		var status;
		fs.readFile('status.json', function(err,data) {
					if(err) {
						return console.log(err);
					}
					var wc_status;
					wc_status = JSON.parse(data);
					if (req.body) {
						var requestBody = req.body;	
						if (requestBody.result) {
							if (requestBody.result.action === actionSetStatus) {
								if ((requestBody.result.parameters.Status === occupied) && (wc_status["status"] === occupied)) {
									speech = "I'm sorry, WC is occupied for now";
								}
								if ((requestBody.result.parameters.Status === vacant) && (wc_status["status"] === vacant)) {
									speech = "WC is alredy vacant";
								} 
								if ((requestBody.result.parameters.Status === occupied) && (wc_status["status"] === vacant)) {
									wc_status["status"] = occupied;
									status = JSON.stringify(wc_status);
									fs.writeFile('status.json',status, function(err) {
										if (err) {
											return console.log(err);
										}
									});
									speech = "WC status was set to occupied";
								}								
								if ((requestBody.result.parameters.Status === vacant) && (wc_status["status"] === occupied)) {
									wc_status["status"] = vacant;
									status = JSON.stringify(wc_status);
									fs.writeFile('status.json',status, function(err) {
										if (err) {
											return console.log(err);
										}
									});
									speech = "WC status was set to vacant";
								}					
							}
						}
					}

					return res.json({
						speech: speech,
						displayText: speech,
						source: 'wc_webhook'
					});
				});
		

	} catch(err) {
		console.error("Can't process request", err);

		return res.status(400).json({
			status: {
				code: 400,
				errorType: err.message
			}
		});
	}
});

restService.listen((process.env.PORT || 5000), function() {
	console.log("Server listening");
});
