var fs = require('fs'); 

function get_html_file(filename, response) {
	//console.log("downloading html-file: " + filename);
	response.setHeader("Content-Type", "text/html");
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.statusCode=200;
	fs.readFile('./' + filename, (err, data) => {
		if (err) throw err;
		response.write(data);
		response.end();
		//console.log("file " + filename + " downloaded");		
	});
  }

function get_picture_file(filename, response) {
	//console.log("downloading picture-file: " + filename);
	response.setHeader("Content-Type", "image/x-icon");
	response.setHeader("Access-Control-Allow-Origin", "*");
	fs.readFile('./' + filename, (err, data) => {
		if (!err)
		{
			response.statusCode=200;
			response.write(data);
			response.end();
			//console.log("file " + filename + " downloaded");
		}
		else
		{	
			//обработка ошибки
			//console.log("file " + filename + " not found");
			response.statusCode=404;
			response.end();
		
		}	
	});
  }

  

exports.get_html_file = get_html_file;
exports.get_picture_file = get_picture_file;

//exports.upload = upload;