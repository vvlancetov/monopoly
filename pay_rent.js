var db = require("./databasehandler");

function pay_rent (payer_id, receiver_id, field_id)
{
	function return_result (res)
		{
			let has_full_group=true;
			for(let i=0;i<res.rows.length();i++)
			{
				//if (res.rows[i].
				
			}
			
		}
	
	function return_error (err)
		{
			console.log("pay_rent error:" + err);
			
		}
	
	
	var sql_query = "SELECT * FROM fields WHERE field_id=" + field_id;
	var db_res = db.db_query_pro(sql_query, return_result, return_error);
}  
 
 
 exports.pay_rent = pay_rent;

 /*
 
 begin;
 insert into lobby (user_id) values (1);
 insert into lobby (user_id) values (2);
 insert into lobby (user_id) values (3);
 insert into lobby (user_id) values (4);
 commit;
 
 
 */