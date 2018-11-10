var filehandler = require("./filehandler");
var datahandler = require("./datahandler");
var userhandler = require("./userhandler");


function route(request, method, response) {
  //console.log("got query to route ");

if (method=="GET")
	{
	//обработка запросов типа GET
	if (request.url=="/")
		{
		filehandler.get_html_file("index.html", response);
		}
	else if (request.url=="/info")
		{
		datahandler.getinfo(response);
		}
	else if (request.url=="/info_lobby")
		{
		datahandler.getinfo_lobby(response);
		}
	else if (request.url=="/register")
		{
		filehandler.get_html_file("register.html", response);
		}
	else if (request.url.substr(0,5) =="/game")
		{
		filehandler.get_html_file("game.html", response);
		}
	else if (request.url.substr(0,12) =="/show_scores")
		{
		datahandler.get_scores(request.url.split("?")[1].split("=")[1], response);
		}
	else if (request.url.substr(0,11) =="/show_field")
		{
		datahandler.get_field(request.url.split("?")[1].split("=")[1], response);
		}
	else if (request.url.substr(0,10) =="/show_chat")
		{
		datahandler.get_chat(request.url.split("?")[1].split("=")[1], response);
		}
	else if (request.url.substr(0,14) =="/get_game_data")
		{
		//console.log(request.url.split("?")[1].split("=")[1]);
		datahandler.get_game_data(request.url.split("?")[1].split("=")[1], response);
		}
	else if (request.url=="/favicon.ico")
		{
		filehandler.get_picture_file("favicon.ico", response);
		} 
	else 
		{
		response.setHeader("Content-Type", "text/plain");
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.statusCode=200;
		response.write("Can not handle this GET query");
		response.end();
		}
	} 
	else if (method=="POST")
		{
		//обработка запросов типа POST
		//console.log("process POST query, request=" + request.url);
		//var urlencodedParser = bodyParser.urlencoded({extended: false});
		
		var post_data="";
		request.addListener("data", function(new_data) {
			// called when a new chunk of data was received
			post_data+=String(new_data);
			//console.log("post_data: " + post_data);
			if(post_data.length > 10000)
				{
					request.connection.destroy();
					response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/html'});
					response.end("Error! Too much data.");
				}
		});
		
		request.addListener("end", function() {
			// called when all chunks of data have been received
			//console.log("POST query processed: " + post_data.length + " bytes");
			//console.log(post_data);

			if (request.url=="/login")
				{
				//console.log("route login");
				userhandler.login(post_data, response);
				} 
			else if (request.url=="/join")
				{
				//console.log("route join");
				userhandler.join(post_data, response);
				} 
			else if (request.url=="/quit_lobby")
				{
				//console.log("route quit lobby");
				userhandler.quit_lobby(post_data, response);
				} 
			else if (request.url=="/register")
				{
				//console.log("regisner new user");
				userhandler.register(post_data, response);
				} 
			else if (request.url=="/check_game")
				{
				//console.log("checking for game");
				userhandler.check_game(post_data, response);
				} 
			else if (request.url=="/get_ID")
				{
				//console.log("checking for game");
				userhandler.get_ID(post_data, response);
				} 
			else if (request.url=="/buy_field")
				{
				//console.log("buy=" + post_data);
				userhandler.buy_field(post_data, response);
				} 
			else if (request.url=="/buy_auction_field")
				{
				//console.log("buy=" + post_data);
				userhandler.buy_auction_field(post_data, response);
				} 
			else if (request.url=="/sell_field")
				{
				//console.log("buy=" + post_data);
				userhandler.sell_field(post_data, response);
				} 
			else 
				{
				datahandler.get_post_data(post_data, response);
				}
			
		});
		/*
		console.log(request);
		response.setHeader("Content-Type", "text/plain");
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.statusCode=200;
		response.write("5");
		response.end();
		*/
		}
}

exports.route = route;