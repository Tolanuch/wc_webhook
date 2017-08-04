const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const VACANT = 'vacant';
const OCCUPIED = 'occupied';
const actionSetStatus = 'setStatus';

const restService = express();
restService.use(bodyParser.json());

restService.post('/webhook', function(req,res) {
	try {
		let wc_status = readStatus(function(wc_status) {
			let speech = setStatus(req,wc_status);
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

var readStatus = function (callback) {
	return fs.readFile('status.json', function (err, data) {
        if (err) {
            return console.log(err);
        }
        return callback(JSON.parse(data));
   });
}

var setStatus = function (req,wc_status) {
	let speech = 'Please,  type \'o\' or \'v\' if you would like to change status';
	let status;
	if (req.body) {
		let requestBody = req.body;	
		if (requestBody.result) {
			if (requestBody.result.action === actionSetStatus) {
				if ((requestBody.result.parameters.Status === OCCUPIED) && (wc_status["status"] === OCCUPIED)) {
					speech = "I'm sorry, WC is occupied for now";
				}
				if ((requestBody.result.parameters.Status === VACANT) && (wc_status["status"] === VACANT)) {
					speech = "WC is alredy vacant";
				} 
				if ((requestBody.result.parameters.Status === OCCUPIED) && (wc_status["status"] === VACANT)) {
					wc_status["status"] = OCCUPIED;
					status = JSON.stringify(wc_status);
					writeStatus(status);
					speech = "WC is occupied now";
				}								
				if ((requestBody.result.parameters.Status === VACANT) && (wc_status["status"] === OCCUPIED)) {
					wc_status["status"] = VACANT;
					status = JSON.stringify(wc_status);
					writeStatus(status);
					speech = "WC is vacant now";
				}					
			}
		}
	}
	return speech;
}

var writeStatus = function(status) {
	fs.writeFile('status.json',status, function(err) {
		if (err) {
			return console.log(err);
		}
	});
}

restService.listen((process.env.PORT || 5000), function() {
	console.log("Server listening");
});
