const http = require('http');
var router = require("./router");
var watchdog = require("./watchdog");
global_lobby_timer=-1;

const port = 8080;
const host = "127.0.0.1";
const requestHandler = (request, response) => {
    //show connection headers in log
	//console.log("incoming connection => METHOD: \"" + request.method + "\", HOST: \"" + request.headers.host + "\", CONNECTION: \"" + request.headers.connection + "\" ORIGIN: \"" + request.headers.origin + "\" REQUEST URL: \"" + request.url +"\"");
	//console.log("=============================================");
	//console.log(request.url);
	//console.log("=============================================");
	if (request.method=="GET") 
	router.route(request, "GET", response);
	if (request.method=="POST") 
	router.route(request, "POST", response);
	
}

const server = http.createServer(requestHandler)
server.listen(port, host, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`server is listening on ${port} ` + "\nserver.listening = " + server.listening);
	//start checking for full lobby
			setTimeout(function run_lobby_check() {
			watchdog.check_for_full_lobby();
			setTimeout(run_lobby_check, 3000);
			}, 5000);
	//starting game daemon
			setTimeout(function run_game_daemon() {
			watchdog.run_game();
			setTimeout(run_game_daemon, 3000);
			}, 5000);
				
})

