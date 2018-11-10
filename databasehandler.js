var pg = require('pg')

function db_query(sql_query, callback) {
	//console.log("making bd query:");
	var db_client = new pg.Client({
	host:"localhost",
	port:5432,
	user:"dbuser",
	password:"qwerty",
	database: "monopoly",
	});
	//console.log("client created");
	db_client.connect()
	.then(()=>{
			db_client.query(sql_query)
			.then(result => callback(result))
			.catch(e=>console.error("databasehandler:" + e.stack + " query was " + sql_query))
			.then (()=>db_client.end())
			})
	.catch(e=>console.error("connection: " + e.stack));
	//console.log("result1: " + result);
  
  }

function db_query_pro(sql_query, return_result,return_error) {
	//query, version 2
	var db_client = new pg.Client({
	host:"localhost",
	port:5432,
	user:"dbuser",
	password:"qwerty",
	database: "monopoly",
	});
	//console.log("client created");
	return db_client.connect()
	.then(()=>{
			db_client.query(sql_query)
			.then(result => return_result(result))
			.catch(e=>console.error("databasehandler:" + e.stack + " query was " + sql_query))
			.then (()=>db_client.end())
			})
	.catch(error=>{console.error("connection error: " + error.stack);return_error(error.stack)});
	//console.log("result1: " + result);
  }
 
function db_query_3(sql_query) {
	//query, version 3
	var db_client = new pg.Client({
	host:"localhost",
	port:5432,
	user:"dbuser",
	password:"qwerty",
	database: "monopoly",
	});
	
	var query_promise = new Promise (make_query);
	
	
	function make_query(response, reject)
		{
			db_client.connect()
			.then(()=>{
					db_client.query(sql_query)
					.then(response)
					.catch(e=>console.error("databasehandler query_3: " + e.stack + " query was " + sql_query))
					.then (()=>db_client.end())
					})
			.catch(error=>{
				console.error("connection error: " + error.stack);
				reject(error.stack)
				});
			//return db_client;
			//console.log("result1: " + result);
		}
	return query_promise;
  }

 
 exports.db_query = db_query;
 exports.db_query_pro = db_query_pro;
 exports.db_query_3 = db_query_3;
