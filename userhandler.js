var db = require("./databasehandler");

function login(post_data, response) {
	var request = parse_post(post_data);
	//проверка пары логин/пароль в базе данных
	var sql_query="SELECT * from USERS where user_login='" + request[0][0] + "' and user_pass='" + request[0][1] + "'";
	//console.log(sql_query);
	var db_res = db.db_query(sql_query, (res) => {
			//console.log("count=" + res.rowCount);
			if (res.rowCount>0) {
				//делаем запрос к БД
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
				response.end(String(res.rows[0].user_id));
				//console.log("login OK");
			}
			else 
			{
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
				response.end("NO USER");
				//console.log("User & Pass do not exist");
			}
		}
	);
	
  }

function join(post_data, response) {
	var request = parse_post(post_data);
	//проверка пары логин/пароль в базе данных
	var sql_query="SELECT user_id from USERS where user_login='" + request[0][0] + "' and user_pass='" + request[0][1] + "' and user_state='free'";
	//console.log("SELECT * from USERS where user_login='" + request[0][0] + "' and user_login='" + request[0][1] + "'");
	var db_res = db.db_query(sql_query, (res) => {
			//console.log("count=" + res.rowCount);
			//колбэк для проверки пользователя
			if (res.rowCount>0) {
				//console.log("user_id=" + res.rows[0].user_id);
				var user_id=res.rows[0].user_id;
				//проверка пользователя и пароля прошла успешно + свободный статус
				var sql_query="INSERT INTO lobby (user_id) values (" + user_id + ")";
				var db_res = db.db_query(sql_query, (res) => {
					//console.log("insert " + res.rowCount);
					if (res.rowCount>0) {
						//успешная вставка
						//теперь меняем статус пользователя
						var sql_query="UPDATE users SET user_state='lobby' WHERE user_id=" + user_id;
						var db_res = db.db_query(sql_query, (res) => {
						//console.log("UPD STATE " + res.rowCount);
						if (res.rowCount>0) {
							response.setHeader("Content-Type", "text/plain");
							response.setHeader("Access-Control-Allow-Origin", "*");
							response.statusCode=200;
							response.end("OK");
							//console.log("join OK");
						}
						else 
						{
							response.setHeader("Content-Type", "text/plain");
							response.setHeader("Access-Control-Allow-Origin", "*");
							response.statusCode=200;
							response.end("JOIN ERROR");
							//console.log("Can not join");
						}
						
						});
					}
					else 
					{
						response.setHeader("Content-Type", "text/plain");
						response.setHeader("Access-Control-Allow-Origin", "*");
						response.statusCode=200;
						response.end("JOIN ERROR");
						//console.log("Can not join");
					}

				});

			}
			else 
			{
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
				response.end("JOIN ERROR");
				//console.log("Can not join");
			}

		}
	);
	
  }
  
function quit_lobby(post_data, response) {
	var request = parse_post(post_data);
	//проверка пары логин/пароль в базе данных
	var sql_query="SELECT user_id from USERS where user_login='" + request[0][0] + "' and user_pass='" + request[0][1] + "' and user_state='lobby'";
	//console.log(sql_query);
	var db_res = db.db_query(sql_query, (res) => {
			//console.log("count=" + res.rowCount);
			//колбэк для проверки пользователя
			if (res.rowCount>0) {
				//console.log("user_id=" + res.rows[0].user_id);
				var user_id=res.rows[0].user_id;
				//проверка пользователя и пароля прошла успешно +  статус LOBBY
				var sql_query="DELETE FROM lobby WHERE user_id=" + user_id;
				var db_res = db.db_query(sql_query, (res) => {
					//console.log("deleted rows= " + res.rowCount);
					if (res.rowCount>0) {
						//успешное удаление
						//теперь меняем статус пользователя
						var sql_query="UPDATE users SET user_state='free' WHERE user_id=" + user_id;
						var db_res = db.db_query(sql_query, (res) => {
						//console.log("UPD STATE " + res.rowCount);
						if (res.rowCount>0) {
							response.setHeader("Content-Type", "text/plain");
							response.setHeader("Access-Control-Allow-Origin", "*");
							response.statusCode=200;
							response.end("OK");
							//console.log("quit lobby OK");
						}
						else 
						{
							response.setHeader("Content-Type", "text/plain");
							response.setHeader("Access-Control-Allow-Origin", "*");
							response.statusCode=200;
							response.end("QUIT ERROR");
							//console.log("Can quit");
						}
						
						});
					}
					else 
					{
						response.setHeader("Content-Type", "text/plain");
						response.setHeader("Access-Control-Allow-Origin", "*");
						response.statusCode=200;
						response.end("JOIN ERROR");
						//console.log("Can not join");
					}

				});

			}
			else 
			{
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
				response.end("JOIN ERROR");
				//console.log("Can not join");
			}

		}
	);
	
  }
  
  function register(post_data, response) {
	var request = parse_post(post_data);
	//проверка ввода
	if (request[0][0].length<3 || request[0][0].length<3)
		{
			response.setHeader("Content-Type", "text/plain");
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.statusCode=200;
			response.end("Too short data");
			return false;
		}	
	//проверка пары логин/пароль в базе данных
	var sql_query="SELECT * from USERS where user_login='" + request[0][0] + "'";
	//console.log(sql_query + "\n" + request);
	var db_res = db.db_query(sql_query, (res) => {
			//console.log("count=" + res.rowCount);
			if (res.rowCount==0) {
				//делаем запрос к БД на вставку юзверя
				var sql_query="insert into users (user_login, user_pass) values ('" + request[0][0] + "','" + request[0][1] + "')";
				//console.log(sql_query);
				var db_res = db.db_query(sql_query, (res) => {
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
				response.end("OK");
				//console.log("register OK");
				
				});
			}
			else 
			{
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
				response.end("USER EXIST");
				//console.log("User & Pass do not exist");
			}
		}
	);
	
  }

  function check_game(post_data, response) {
	var request = parse_post(post_data);
	//проверка пары логин/пароль в базе данных
	var sql_query="SELECT user_id from USERS where user_login='" + request[0][0] + "' and user_pass='" + request[0][1] + "'"; // and user_state='game'";
	//console.log(sql_query);
	var db_res = db.db_query(sql_query, (res) => {
			//console.log("users found = " + res.rowCount);
			//колбэк для проверки пользователя
			if (res.rowCount>0) {
				//console.log("user_id=" + res.rows[0].user_id);
				var user_id=res.rows[0].user_id;
				//проверка пользователя и пароля прошла успешно +  статус LOBBY
				var sql_query="SELECT * from games where " + user_id + "= ANY(users_id) AND game_state='running' ORDER BY game_id";
				//console.log(sql_query);
				var db_res = db.db_query(sql_query, (res) => {
						//console.log("games count=" + res.rowCount);
						if (res.rowCount==0) {
							//делаем запрос к БД
							response.setHeader("Content-Type", "text/plain");
							response.setHeader("Access-Control-Allow-Origin", "*");
							response.statusCode=200;
							response.end("NO GAME");
							//console.log("NO GAME");
						}
						else 
						{
							response.setHeader("Content-Type", "text/plain");
							response.setHeader("Access-Control-Allow-Origin", "*");
							response.statusCode=200;
							response.end("ID=" + res.rows[0].game_id);
							//console.log("FOUND GAME: " + res.rows[0].game_id);
						}
					}
				);
			}
			else
			{
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
				response.end("NO GAME");
			}
			
		}
	);
  }

  
  function parse_post(post_data)
  {
	var request=[];
	
	for (let i=0;i<post_data.length;i++)
	{
	let j=post_data.indexOf("Content-Disposition: form-data; name=",i);
	if (j>=0)
		{
		//variable found
		j+=38;
		//let z=request.indexof('\"', j)-j;
		let var_name=post_data.substr(j,post_data.indexOf('\"', j)-j);
		let k=post_data.indexOf("\n",post_data.indexOf("\n",j)+1);
		let k2=post_data.indexOf("\r",k+1);
		let var_value = post_data.substr(k+1,(k2-k)-1);
		request.push([var_name,var_value]);
		i=k2;
		}
	}
	//console.log(request);
	return request;
  }  

function get_ID(post_data, response) {
	var request = parse_post(post_data);
	//проверка пары логин/пароль в базе данных
	var sql_query="SELECT * from USERS where user_login='" + request[0][0] + "' and user_pass='" + request[0][1] + "'";
	//console.log(sql_query);
	var db_res = db.db_query(sql_query, (res) => {
			//console.log("count=" + res.rowCount);
			if (res.rowCount>0) {
				//делаем запрос к БД
				//console.log(String(res.rows[0].user_id));
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
				response.end(String(res.rows[0].user_id));
				//console.log("login OK");
			}
			else 
			{
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=401;
				response.end();
				//console.log("User & Pass do not exist");
			}
		}
	);
	
  }

function buy_field(post_data, response) {
	var request = parse_post(post_data);
	
	/*Структура запроса
	post_request.append("login", login);
	post_request.append("pass", pass);
	post_request.append("user_id",user_id);
	post_request.append("game_id", game_id);
	post_request.append("field_id", field_id);
	*/

	//проверка пары логин/пароль в базе данных
	var sql_query="SELECT *,(select users_id from games where game_id=" + request[3][1] + ") as users from USERS where user_login='" + request[0][1] + "' and user_pass='" + request[1][1] + "' AND user_id='" + request[2][1] + "'";
	//console.log(sql_query);

	var db_res = db.db_query_3(sql_query);
	//console.log(typeof(db_res));
	db_res
	.then(update_fields)
	.then(send_response)
	.catch(err =>{console.log("error: " + err);response.end("Error:" + err);})
	
	function update_fields (res)
		{
			//console.log("result_rows=" + res.rowCount);
			
			if (res.rowCount==0) return new Error("login+pass+id = invalid");
			let buyer_index=-1; //позиция в массиве
			for(let i=0;i<res.rows[0].users.length;i++)
			{
				if (res.rows[0].users[i]==request[2][1]) buyer_index=i;
			}
			//console.log(res.rows[0].users);
			//console.log("buyer_index=" + buyer_index);
			//console.log("user_id=" + request[2][1]);
			
			var sql_query="UPDATE games SET field_owners[" + (Number(request[4][1])+1) + "]=" + request[2][1] + ",users_money[" +  (buyer_index + 1) + "]=users_money[" +  (buyer_index + 1) + "]-(select base_price from fields where field_id=" + request[4][1] + ") WHERE game_id=" + request[3][1] + " and (field_owners[" + (Number(request[4][1])+1) + "]=0 or field_owners[" + (Number(request[4][1])+1) + "] IS NULL) and move_state='wait' and active_user_id=" + request[2][1] + ";";
			//console.log(sql_query);
			//пишем в лог 
			let mess="player " + request[0][1] + " bought field # " + request[4][1];
			var data=new Date();
			let data_str= " '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
			sql_query+="INSERT INTO game_chat (user_id, game_id, message, data) VALUES (0," + request[3][1] + ",'" + mess + "', " + data_str + ");";

			//console.log(sql_query);
			return new db.db_query_3(sql_query);
		}

	function send_response(res)
		{
			//console.log("field bought");
			response.setHeader("Content-Type", "text/plain");
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.statusCode=200;
			response.end("Done");
		}

}
  
function sell_field(post_data, response) {
	var request = parse_post(post_data);
	//проверка пары логин/пароль в базе данных
	var sql_query="SELECT *,(select users_id from games where game_id=" + request[3][1] + ") as users_id from USERS where user_login='" + request[0][1] + "' and user_pass='" + request[1][1] + "' AND user_id='" + request[2][1] + "'";
	//console.log(sql_query);
	var db_res = db.db_query_3(sql_query);
	//console.log(typeof(db_res));
	db_res
	.then(update_fields)
	.then(send_response)
	.catch(err =>{console.log("error: " + err);response.end("Error:" + err);})
	
	function update_fields (res)
		{
			//console.log("result_rows=" + res.rowCount);
			if (res.rowCount==0) return new Error("login+pass+id = invalid");
			let seller_index=-1; //позиция в массиве
			for(let i=0;i<res.rows[0].users_id.length;i++)
			{
				if (res.rows[0].users_id[i]==request[2][1]) seller_index=i;
			}
			var sql_query="UPDATE games SET field_owners[" + (Number(request[4][1])+1) + "]=0,users_money[" +  (seller_index + 1) + "]=users_money[" +  (seller_index + 1) + "]+(select base_price/2 from fields where field_id=" + request[4][1] + ") WHERE game_id=" + request[3][1] + " and (field_owners[" + (Number(request[4][1])+1) + "]=" +  request[2][1] + ");";
			//пишем в лог 
			let mess="player " + request[0][1] + " sold field # " + request[4][1];
			var data=new Date();
			let data_str= " '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
			sql_query+="INSERT INTO game_chat (user_id, game_id, message, data) VALUES (0," + request[3][1] + ",'" + mess + "', " + data_str + ");";
			//console.log("seller_index=" + seller_index);
			//console.log(sql_query);
			return new db.db_query_3(sql_query);
		}

	function send_response(res)
		{
			//console.log("field sold " + res[0]);
			response.setHeader("Content-Type", "text/plain");
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.statusCode=200;
			response.end("Done");
		}

}

function buy_auction_field(post_data, response) {
	var request = parse_post(post_data);
	//console.log("auc_request");
	/*
	список полей запроса
	post_request.append("login", login);
	post_request.append("pass", pass);
	post_request.append("user_id",user_id);
	post_request.append("game_id", game_id);
	post_request.append("bet", bet);
	*/
	
	
	//проверка пары логин/пароль в базе данных
	var sql_query="SELECT * from USERS where user_login='" + request[0][1] + "' and user_pass='" + request[1][1] + "' AND user_id='" + request[2][1] + "'";
	//console.log(sql_query);


	var db_res = db.db_query_3(sql_query);
	//console.log(typeof(db_res));
	db_res
	.then(get_auction_data)
	.then(update_fields)
	//.catch(err =>{console.log(err + " 1");})
	.then(send_response)
	.catch(err =>{console.log("error: " + err);response.end("Error:" + err);})
	
	function get_auction_data (res)
		{
			if (res.rowCount==0) throw new Error("login+pass+id = invalid");
			var sql_query="SELECT move_state, auction FROM games WHERE game_id=" + request[3][1] + " AND " + request[2][1] + "=ANY(users_id)";
			//console.log(sql_query);
			return new db.db_query_3(sql_query);
		}
	
	function update_fields (res)
		{
			//console.log("result_rows=" + res.rowCount);
			if (res.rowCount==0) throw new Error("incorrect query");
			//проверяем инфо по нужному аукциону
			if(res.rows[0].move_state!="auction") throw new Error("incorrect move state"); 
			if(Number(res.rows[0].auction[1])>Number(request[4][1]))
				{	
					
					throw new Error("incorrect bet: " + request[4][1]);
				}
			if(Number(res.rows[0].auction[1])==Number(request[4][1]) && Number(res.rows[0].auction[2])>0) 
				{
					throw new Error("incorrect bet: " + request[4][1]);
				}
			let data_now=new Date();
			let data_end = new Date(res.rows[0].auction[3]);
			if(data_now>data_end) throw new Error("you are too late"); 
		
			//обновляем инфо
			//console.log(res.rows);
			var auction_array=[];
			auction_array.push(Number(res.rows[0].auction[0]));
			auction_array.push(Number(request[4][1]));
			auction_array.push(Number(request[2][1]));
			var data=new Date();
			data.setSeconds(data.getSeconds() + 20);//добавляем время аукциона
			auction_array.push(data);
			var sql_query = "BEGIN;UPDATE games SET auction='" + JSON.stringify(auction_array) + "' WHERE game_id=" + request[3][1] + " AND move_state='auction';";
			//console.log(sql_query);
			//пишем в лог 
			let mess="player " + request[2][1] + " (" + request[0][1] + ") made bet " + request[4][1] + "$";
			var data=new Date();
			let data_str= " '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
			sql_query+="INSERT INTO game_chat (user_id, game_id, message, data) VALUES (0," + request[3][1] + ",'" + mess + "', " + data_str + ");";
			sql_query+="COMMIT;";
			//console.log(sql_query);
			return new db.db_query_3(sql_query);
		}

	function send_response(res)
		{
				//console.log(res);
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
			if (res[1].rowCount==1)
				{
					//console.log("bet made");
					response.end("OK");
				}
			else
				{
					console.log("bet fail");
					//response.end("Bet fail");
				}
		}

}

	
exports.login = login;
exports.join = join;
exports.quit_lobby = quit_lobby;
exports.register = register;
exports.check_game = check_game;
exports.get_ID = get_ID;
exports.buy_field = buy_field;
exports.sell_field = sell_field;
exports.buy_auction_field = buy_auction_field;
