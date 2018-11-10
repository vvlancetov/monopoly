var db = require("./databasehandler");


function get_post_data(post_data, response) {
	//console.log("getting data from database... ");
	var request = parse_post(post_data);
	//console.log(request);
	
	response.setHeader("Content-Type", "text/plain");
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.statusCode=200;
	response.end();
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
	return request;
  }  

function getinfo(response) {
	var data_to_transfer=[];
	
	var data_collector=new Promise(stage1);
	
	data_collector
	.then(stage2)
	.then(stage3)
	.then(stage4)
	.then(stage5)
	.then(send_response)
	.catch(e=>{console.log(e)});
	
	function stage1(response, reject)
		{
			var sql_query="select count(user_id) as users, sum (CASE user_state when 'game' then 1 else 0 end) as online from users";
			response(new db.db_query_3(sql_query));
		}
	function stage2(res)
		{
			//console.log(res.rows[0]);
			data_to_transfer.push({"totalusers" : res.rows[0].users});
			data_to_transfer.push({"onlineusers" : res.rows[0].online});
			
			var sql_query="select count(game_id) as playedgames from games where game_state='finished'";
			return new db.db_query_3(sql_query);
		}

		function stage3(res)
		{
			//console.log(res.rows[0]);
			data_to_transfer.push({"playedgames" : res.rows[0].playedgames});
			var sql_query="select games.users_id, games.users_money from games where game_state='finished'";
			return new db.db_query_3(sql_query);
		}

		function stage4(res)
		{
			let wins=[];
			//console.log(res.rows);
			for(let i=0;i<res.rows.length;i++)
				{
					for(let j=0;j<res.rows[i].users_id.length;j++)
						{
							//console.log(res.rows[i].users_money[j]);
							if(res.rows[i].users_money[j]>0) 
								{
									if (wins[res.rows[i].users_id[j]]!=null) wins[res.rows[i].users_id[j]]++;
									else wins[res.rows[i].users_id[j]]=1;
									//console.log(res.rows[i].users_id[j]+ " +");
								}
						}
				}
				
			//console.log(wins);
			data_to_transfer.push({"leaderboard" : wins});
			var sql_query="select game_id, users_id from games where game_state='running'";
			return new db.db_query_3(sql_query);
		}

		function stage5(res)
		{
			data_to_transfer.push({"currentgames" : JSON.stringify(res.rows)});
			return;
		}

		function send_response(res)
		{
			response.setHeader("Content-Type", "text/plain");
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.statusCode=200;
			response.end(JSON.stringify(data_to_transfer));
			return;
		}
	
	
  
}

function getinfo_lobby(response) {
	
	var sql_query="select distinct lobby.*, user_login from lobby left join users ON lobby.user_id=users.user_id";
	//console.log("SELECT * from USERS where user_login='" + request[0][0] + "' and user_login='" + request[0][1] + "'");
	var db_res = db.db_query(sql_query, (res) => {
			//console.log("lobby_users_count=" + res.rowCount);
			if (res.rowCount>0) {
				//load users to array
				var users = [];
				for (let i=0;i<res.rowCount;i++)
				{
					users.push(res.rows[i].user_login);
				}
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
				response.end(JSON.stringify(users));
				//console.log("info_lobby sent");
				//console.log("lobby_data: " + res.rowCount);
			}
			else
			{
				//lobby is empty
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
				response.end("empty lobby");

			}
		}
	);
}

function get_scores (game_id, response)
{
	function return_result (res)
		{
			//колбэк для возврата результатов запроса
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
			
			if (res.rowCount==0) 
			{
				response.end("no game");
			} 
			else
			{
				let data_to_send=[];
				data_to_send.push(res.rows[0].users_id);
				data_to_send.push(res.rows[0].users_money);
				data_to_send.push(res.rows[0].users_positions);
				data_to_send.push(res.rows[0].active_user_id);
				response.end(JSON.stringify(data_to_send));
			}
			
			
			
		}
	
	function return_error (err)
		{
			//колбэк для возврата ошибки
			response.setHeader("Content-Type", "text/plain");
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.statusCode=200;
			response.end(err);
		}
	
	
	var sql_query = "SELECT users_id, users_money, users_positions, active_user_id FROM games WHERE game_id=" + game_id;
	var db_res = db.db_query_pro(sql_query, return_result, return_error);
}  
 
function get_field (game_id, response)
{
	function return_result (res)
		{
			//колбэк для возврата результатов запроса
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
			
			if (res.rowCount==0) {
				response.end("no field");
			} 
			else
			{
				
				function return_result (res2)
				{
					response.end(JSON.stringify([res.rows,res2.rows[0]]));
				}
				function return_error (err)
				{
					//колбэк для возврата ошибки
					response.setHeader("Content-Type", "text/plain");
					response.setHeader("Access-Control-Allow-Origin", "*");
					response.statusCode=200;
					response.end(err);
				}
				var sql_query = "SELECT * FROM games WHERE game_id="+game_id;
				var db_res = db.db_query_pro(sql_query, return_result, return_error);
			}
		}
	
	function return_error (err)
		{
			//колбэк для возврата ошибки
			response.setHeader("Content-Type", "text/plain");
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.statusCode=200;
			response.end(err);
		}
	
	
	var sql_query = "SELECT * FROM fields";
	var db_res = db.db_query_pro(sql_query, return_result, return_error);
}  

function get_chat (game_id, response)
{
	function return_result (res)
		{
			//колбэк для возврата результатов запроса
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
			
			if (res.rowCount==0) {
				response.end("no game");
			} 
			else
			{
				response.end(JSON.stringify(res.rows));
			}
		}
	
	function return_error (err)
		{
			//колбэк для возврата ошибки
			response.setHeader("Content-Type", "text/plain");
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.statusCode=200;
			response.end(err);
		}
	
	
	var sql_query = "SELECT * FROM game_chat WHERE game_id=" + game_id + " ORDER BY data DESC LIMIT 10";
	var db_res = db.db_query_pro(sql_query, return_result, return_error);
}  
 
function get_game_data (game_id, response)
{
	function return_result (res)
		{
			//колбэк для возврата результатов запроса
				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.statusCode=200;
			
			if (res.rowCount==0) {
				response.end("no game");
			} 
			else
			{
				let data_to_send=[];
				data_to_send.push(res.rows[0].users_id);//0
				data_to_send.push(res.rows[0].users_money);
				data_to_send.push(res.rows[0].users_positions);
				data_to_send.push(res.rows[0].active_user_id);
				data_to_send.push(res.rows[0].next_turn);//4
				data_to_send.push(res.rows[0].move_state);
				data_to_send.push(res.rows[0].field_owners);
				data_to_send.push(res.rows[0].fields_layout);
				data_to_send.push(res.rows[0].auction);//8
				
				//console.log(res.rowCount);
				response.end(JSON.stringify(data_to_send));
			}
		}
	
	function return_error (err)
		{
			//колбэк для возврата ошибки
			response.setHeader("Content-Type", "text/plain");
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.statusCode=200;
			response.end(err);
		}
	
	
	var sql_query = "SELECT * FROM games WHERE game_id="+game_id;
	var db_res = db.db_query_pro(sql_query, return_result, return_error);
}  

 
 exports.get_post_data = get_post_data;
 exports.getinfo = getinfo;
 exports.getinfo_lobby = getinfo_lobby;
 exports.get_scores = get_scores;
 exports.get_field = get_field;
 exports.get_chat = get_chat;
 exports.get_game_data = get_game_data;
 