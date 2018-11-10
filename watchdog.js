var db = require("./databasehandler");
//var db = require("./pay_rent");

function check_for_full_lobby() {
	//проверка пары логин/пароль в базе данных
	var sql_query="SELECT DISTINCT * from lobby limit 8"; //LIMIT 8
	//делаем запрос к БД
	var db_res = db.db_query(sql_query, (res) => {
			var users_in_lobby=res.rowCount;
			if (users_in_lobby>0) {
				//console.log("Users: " + users_in_lobby);
				if (users_in_lobby>=8 || (users_in_lobby>=2 && global_lobby_timer==0)) //>=2
				{
					//начинаем игру
					global_lobby_timer=-1;
					//удаляем записи из лобби и вставляем в таблицу с играми
					//console.log("Start game. Users: " + users_in_lobby);
					//создаем запрос на удаление пользователей из базы lobby
					sql_query="begin;delete from lobby where";
					for (let i=0;i<users_in_lobby;i++)
						{
							sql_query+=" user_id=" + res.rows[i].user_id;
							if(i<users_in_lobby-1) sql_query+=" OR";
						}
					//вставляем данные в таблицу games
					sql_query+=";";
					sql_query+="INSERT INTO games (users_id,users_money,game_state,users_positions,active_user_id,next_turn,move_state,field_owners,fields_layout) values (";
					let sql_ids=" ARRAY[";
					let sql_moneys=" ARRAY[";
					let sql_positions=" ARRAY[";
					for (let i=0;i<users_in_lobby;i++)
						{
							sql_ids+=res.rows[i].user_id;
							sql_moneys+="1000";
							sql_positions+="0";
							if(i<users_in_lobby-1) {sql_ids+=", ";sql_moneys+=", ";sql_positions+=", ";}
						}
					sql_ids+="]";sql_moneys+="]";sql_positions+="]";
					sql_query+=sql_ids + ", " + sql_moneys + ", 'running', " + sql_positions + ", 0," ;//добавляем массив с пользователями
					
					let data=new Date();
					sql_query+=" '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
					//sql_query+=" '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
					sql_query+=",'throw',ARRAY[0],'null');";
					
					
					//меняем статус в таблице users
					sql_query+="UPDATE users SET user_state='game' where"; 
					for (let i=0;i<users_in_lobby;i++)
						{
							sql_query+=" user_id=" + res.rows[i].user_id;
							if(i<users_in_lobby-1) sql_query+=" OR";
						}
					sql_query+="; COMMIT;";
					//console.log(sql_query);
					var db_res_begin = db.db_query(sql_query, (res) => {
						//обрабатываем выгрузку таблицы полей и добавляем данные в базу
						
						//console.log("new game: row added");
						
						});
				}
				else if (users_in_lobby>=2)  //2
				{
					//запускаем таймер
					if (global_lobby_timer==-1) 
						{
							global_lobby_timer=3;
							//console.log("Start timer");
						}
					else 
						{
							global_lobby_timer--; //если уже запущен - уменьшаем
							//console.log("Timer: " + global_lobby_timer);
						}
				}
				else
				{
					//останавливаем таймер
					global_lobby_timer = -1;
					//console.log("Stop timer");
				}
				
				
				
				
				
			}
			else 
			{
				
				//console.log("Watchdog: lobby is empty");
			}
		}
	);
	
  }

  function run_game()
	{

	function return_result (res)
		{
			//колбэк для обработки результатов запроса
			if (res.rowCount>0) {
			//обрабатываем каждую игру 
				for(let i=0;i<res.rowCount;i++)
				{
					let game_data=res.rows[i];
					//console.log(game_data);

					if (game_data.move_state=='throw' && game_data.fields_layout!=null)
						{
						//console.log("move_state=throw");
						//если статус THROW - делаем бросок кубика
						//проверяем user_id активного юзверя
						//если ==0, то делаем активным первого юзера в списке
						let act_user=-1;
						if (game_data.active_user_id==0) act_user=game_data.users_id[0];
							else act_user=game_data.active_user_id;
						//вычисляем позицию активного пользователя в массиве	
						let act_user_index=-1;
						for(let i=0;i<game_data.users_id.length;i++)
							{
								if (game_data.users_id[i]==act_user) act_user_index=i;
							}
						//делаем первый бросок
						let user_throw_1=Math.floor(Math.random() * 6) + 1; //бросок костей
						let user_throw_2=Math.floor(Math.random() * 6) + 1; //бросок костей
						//console.log("throw=" + user_throw_1 + "+" + user_throw_2);
						//обновляем поле active_user_id (вдруг это первый бросок)
						let sql_query="BEGIN; UPDATE games SET active_user_id=" + act_user + " WHERE game_id=" + game_data.game_id + ";"; 

						//пишем в лог бросок костей
						mess="User " + act_user + " throw " + user_throw_1 + " + " + user_throw_2 + " and moves for " + (user_throw_1 + user_throw_2) + " fields";
						var data=new Date();
						data_str= " '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
						sql_query+="INSERT INTO game_chat (user_id, game_id, message, data) VALUES (0," + game_data.game_id + ",'" + mess + "', " + data_str + ");";
						//меняем user_position активного пользователя
						let new_pos=game_data.users_positions[act_user_index]+user_throw_1+user_throw_2;
						if (new_pos>39) new_pos=new_pos-40; //круг замкнулся
						sql_query+="UPDATE games SET users_positions["+ (act_user_index+1) +"]=" + new_pos + " WHERE game_id=" + game_data.game_id + ";";
						//устанавливаем новый статус хода - проверка триггеров
						sql_query+="UPDATE games SET move_state='check_triggers' WHERE game_id=" + game_data.game_id + ";";
						sql_query+="COMMIT;";
						//console.log (sql_query); 
						//отправляем запрос в базу данных, определив колбэки
						function return_result_2 (res)
						{
							//запрос выполнен
							//console.log("wait->check_triggers: success");
						}
						function return_error_2(err)
						{
							//ошибка выполнения
							//console.log("wait->check_triggers: error ("+err+")");
							
						}
						
						var db_res_2 = db.db_query_pro(sql_query, return_result_2, return_error_2);
					
						//конец блока THROW №1
						}
					
					if (game_data.move_state=='throw' && game_data.fields_layout==null)
						{
						//при первом запуске добавляем настройки полей в формате JSON
						
						function return_result_4(res)
							{
								json_fields=JSON.stringify(res.rows);
								//console.log(json_fields);
								sql_query="UPDATE games SET fields_layout='"+ json_fields + "' WHERE game_id=" + game_data.game_id;
								//console.log(sql_query);
								var db_res = db.db_query_pro(sql_query, (res)=>{console.log("fields info added");}, (err) => {console.log("error update fields_layout");});
							}
						
						function return_error_4(err)
							{
								console.log("error_4");
							}
						sql_query="select * from fields";
						var db_res = db.db_query_pro(sql_query, return_result_4, return_error_4);
						//конец блока THROW №2 
						}
					
					if (game_data.move_state=='check_triggers')
						{
						//console.log("move_state=check_triggers");
						//делаем необходимые действия после очередного хода типа уплаты ренты
						//вычисляем позицию активного пользователя в массиве	
						var sql_query = "BEGIN;";
						let act_user_index=-1;
						for(let i=0;i<game_data.users_id.length;i++)
							{
								if (game_data.users_id[i]==game_data.active_user_id) act_user_index=i;
							}
						var active_field_id = game_data.users_positions[act_user_index];
						//console.log("field:" + active_field_id + " owner " + game_data.field_owners[active_field_id]);
						if (game_data.field_owners[active_field_id]==0 || game_data.field_owners[active_field_id]==undefined)
							{
								//поле свободно
								//переводим игру в статус WAIT
								sql_query += "UPDATE games SET move_state='wait' WHERE game_id="+game_data.game_id + ";";
								//пишем в лог 
								//let mess="gamestate - > WAIT";
								//var data=new Date();
								//let data_str= " '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
								//sql_query+="INSERT INTO game_chat (user_id, game_id, message, data) VALUES (0," + game_data.game_id + ",'" + mess + "', " + data_str + ");";
								//console.log("check_triggers -> wait (free)");

								}
						else if(game_data.field_owners[active_field_id]==game_data.active_user_id)
							{
								//поле принадлежит игроку
								//ничего не делаем
								sql_query += "UPDATE games SET move_state='wait' WHERE game_id="+game_data.game_id + ";";
								//console.log("check_triggers -> wait (i am owner)");
								
								
							}						
						else
							{
								//поле принадлежит другому игроку
								//рассчитывам плату и производим транзакцию
								
								let user_A = game_data.active_user_id; // ходящий
									let user_A_index=-1; //позиция в массиве
									for(let i=0;i<game_data.users_id.length;i++)
										{
											if (game_data.users_id[i]==user_A) user_A_index=i;
										}

								let user_B = game_data.field_owners[active_field_id];// владелец клетки
									let user_B_index=-1;//позиция в массиве
									for(let i=0;i<game_data.users_id.length;i++)
										{
											if (game_data.users_id[i]==user_B) user_B_index=i;
										}
								
								//console.log(game_data.fields_layout);
								let fields = game_data.fields_layout;//данные полей
								let field_group=fields[active_field_id].group_id;//номер группы поля
								
								//определяем необходимость применения двойной платы, если игрок Б владеет всеми полями
								let multiplier=2;
								for (let i=0;i<=39;i++)
									{
										if (fields[i].group_id==field_group && user_B!=game_data.field_owners[i])
										{
											multiplier=1;
										}
									}
								//вычисляем плату
								let payment=fields[active_field_id].rent_income * multiplier;
								sql_query+="UPDATE games SET users_money[" + (user_A_index+1) + "]=users_money[" + (user_A_index+1) + "]-" + payment + " WHERE game_id="+game_data.game_id + ";";
								sql_query+="UPDATE games SET users_money[" + (user_B_index+1) + "]=users_money[" + (user_B_index+1) + "]+" + payment + " WHERE game_id="+game_data.game_id + ";";
								//пишем в чат
								var data=new Date();
								let data_str= " '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
								let mess = "user " + user_A + " pays " + payment + "$ to user " + user_B;
								sql_query+="INSERT INTO game_chat (user_id, game_id, message, data) VALUES (0," + game_data.game_id + ",'" + mess + "', " + data_str + ");";
								//переводим игру в статус WAIT
								//пишем в чат
								sql_query += "UPDATE games SET move_state='wait' WHERE game_id="+game_data.game_id + ";";
								//console.log("check_triggers -> wait (payed to owner)");
								//var data=new Date();
								//data_str= " '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
								//mess="gamestate - > WAIT";
								//sql_query+="INSERT INTO game_chat (user_id, game_id, message, data) VALUES (0," + game_data.game_id + ",'" + mess + "', " + data_str + ");";
								//console.log("payment from " + user_A + " to " + user_B);
								//console.log(sql_query);
							}	

							{
								//общий блок - меняем время окончания хода
								var data=new Date();
								//console.log("now " + data.getMinutes() + ":" + data.getSeconds());
								data.setSeconds(data.getSeconds() + 20);//время ожидания реакции игрока
								//console.log("next " + data.getMinutes() + ":" + data.getSeconds());
								let data_str= " '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
								sql_query += "UPDATE games SET next_turn=" + data_str + " WHERE game_id="+game_data.game_id + ";";
								sql_query+="COMMIT;";
							}
						
						function return_result_3(res)
							{
								//console.log("success_3");
							}
						
						function return_error_3(err)
							{
								console.log("error_3");
							}
						
						var db_res = db.db_query_pro(sql_query, return_result_3, return_error_3);
						
						//конец блока CHECK_TRIGGERS
						}
					
					if (game_data.move_state=='wait')
						{
							//console.log("waiting");
							//игра уже идет. проверяем не истекло ли время хода
							let data_now=new Date();
							let next_move = new Date(game_data.next_turn);
							//sql_query+=" '" + data.getFullYear() + "-" + data.getMonth() + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
							//console.log(data_now + "  " + next_move);
							if (data_now > next_move)
								{
									//console.log("time is up " + data_now + " > " + next_move);
									//проверяем наличие денег у активного игрока
									let user_A = game_data.active_user_id; // ходящий
									let user_A_index=-1; //позиция в массиве
									for(let i=0;i<game_data.users_id.length;i++)
										{
											if (game_data.users_id[i]==user_A) user_A_index=i;
										}

									//если баланс отрицательный, то игрок банкрот
									if (game_data.users_money[user_A_index]<0) 
										{
											//console.log("user " + user_A + " bankrupt");
											let mess="player " + user_A + " ran out of money";
											var data=new Date();
											let data_str= " '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
											let sql_query="INSERT INTO game_chat (user_id, game_id, message, data) VALUES (0," + game_data.game_id + ",'" + mess + "', " + data_str + ");";
											sql_query+="UPDATE users SET user_state='free' where user_id="+user_A;
											//console.log(sql_query);
											db.db_query_3(sql_query).catch(e=>console.log(e));
										}
									
									//если остался один игрок - победа
									let count=0, winner_index=-1;
									for(let i=0;i<game_data.users_id.length;i++)
										{
											if (game_data.users_money[i]>=0) 
												{
													count++;
													winner_index=i;
												}
										}
									if (count==1) 
										{
											//winner!
											//console.log("winner ID is " + game_data.users_id[winner_index]);
											//обновляем таблицу
											var sql_query = "BEGIN;UPDATE games SET game_state='finished' WHERE game_id=" + game_data.game_id + ";";
											sql_query+="UPDATE users SET user_state='free' where user_id="+game_data.users_id[winner_index] + ";";
											let mess="player " + game_data.users_id[winner_index] + " win the game!";
											var data=new Date();
											let data_str= " '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
											sql_query+="INSERT INTO game_chat (user_id, game_id, message, data) VALUES (0," + game_data.game_id + ",'" + mess + "', " + data_str + ");";
											sql_query+="COMMIT;";
											//получаем выборку текущих игр из таблицы games
											//console.log(sql_query);
											var db_res = db.db_query_pro(sql_query, (res)=>{}, (err)=> {console.log(err)});
										}
									else
										{
											//если игроков с неотрицательной суммой более 1
											//проверяем куплено ли текущее поле, нет - аукцион
											if (game_data.fields_layout[game_data.users_positions[user_A_index]].field_type=="PROPERTY"&& (game_data.field_owners[game_data.users_positions[user_A_index]]==0 || game_data.field_owners[game_data.users_positions[user_A_index]]==null))
												{
													//включаем режим аукциона
													let act_field_price = game_data.fields_layout[game_data.users_positions[user_A_index]].base_price;
													var data=new Date();
													data.setSeconds(data.getSeconds() + 20);//время до окончания аукциона
													//let data_str= " '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
													var sql_query = "UPDATE games SET move_state='auction', auction='" + JSON.stringify([game_data.users_positions[user_A_index],act_field_price,0,data]) + "' WHERE game_id=" + game_data.game_id;
													//[позиция, базовая цена, участник=0,время окончания]
													var db_res = db.db_query_3(sql_query).catch(e=>console.log(e));
												}
											else
												{
													//если аукцион неуместен
													//находим следующего игрока - небанкрота
													let moves=game_data.users_id.length; //максимальное количество шагов перебора
													let next_user_index=-1;
													for(let i=1;i<=moves;i++)
														{
															next_user_index=user_A_index + i;
															if (next_user_index>moves-1) next_user_index-=moves;
															if (game_data.users_money[next_user_index]>=0) break; //следующий ходящий найден
														}
													//обновляем таблицу
													//console.log("next move ID = " + game_data.users_id[next_user_index]);
													var sql_query = "UPDATE games SET active_user_id=" + game_data.users_id[next_user_index] + ", move_state='throw' WHERE game_id=" + game_data.game_id;
													//получаем выборку текущих игр из таблицы games
													var db_res = db.db_query_pro(sql_query, (res)=>{}, (err)=> {console.log(err)});
												}
										}	
								
								}
											
							//конец блока WAIT
						}

					if (game_data.move_state=='auction')
						{
							//проверяем время окончания аукциона
							let data_now = new Date();
							let next_move = new Date(game_data.auction[3]);
							if (data_now > next_move)
								{
									let buyer_id = game_data.auction[2];
									let price = game_data.auction[1];
									let field_id = Number(game_data.auction[0]);
									let buyer_index=-1; //позиция в массиве
									for(let i=0;i<game_data.users_id.length;i++)
										{
											if (game_data.users_id[i]==buyer_id) buyer_index=i;
										}
									//заканчиваем аукцион
									var sql_query = "BEGIN;"
									let mess="";
									if(buyer_id>0) 
										{
											//покупатель найден
											sql_query += "UPDATE games SET field_owners[" + (field_id + 1) + "]=" + buyer_id + ",users_money[" + (buyer_index + 1) + "]=users_money[" + (buyer_index + 1) + "]-" + price + " WHERE game_id=" + game_data.game_id + " and (field_owners[" + (field_id + 1) + "]=0 or field_owners[" + (field_id +1)+ "] IS NULL) and move_state='auction' AND users_money[" + (buyer_index + 1) + "]>=" + price + ";";
											//console.log(sql_query);
											//пишем в лог 
											mess="player " + buyer_id + " bought field # " + (field_id);
										}
									else
										{
											//покупателя нет
											mess="auction for field # " + (field_id) + " failed";
										}
									var data=new Date();
									let data_str= " '" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "'";
									sql_query+="INSERT INTO game_chat (user_id, game_id, message, data) VALUES (0," + game_data.game_id + ",'" + mess + "', " + data_str + ");";
									sql_query+="UPDATE games SET move_state='throw' WHERE game_id=" + game_data.game_id + ";";
									//находим следующего игрока - небанкрота
									let act_user_index=-1;
									for(let i=0;i<game_data.users_id.length;i++)
										{
											if (game_data.active_user_id==game_data.users_id[i]) {act_user_index=i;break;} //позиция активного юзера в массиве
										}
									let next_user_index=-1;
									let moves=game_data.users_id.length; //максимальное количество шагов перебора
									for(let i=1;i<moves;i++)
										{
											next_user_index=act_user_index + i;
											if (next_user_index>moves-1) next_user_index-=moves;
											//console.log("next_user_index=" + next_user_index);
											if (game_data.users_money[next_user_index]>=0) break; //следующий ходящий найден
										}
									sql_query += "UPDATE games SET active_user_id=" + game_data.users_id[next_user_index] + " WHERE game_id=" + game_data.game_id + ";";
									sql_query+="COMMIT;";
									//console.log(sql_query);
									var db_res = db.db_query_3(sql_query)
									.then(res=>{
										if(res[1].rowCount==1){}
										})
									.catch(e=>console.log(e));
								}
						}

				// конец блока FOR 
				// переход к следующей игре в списке	
				}
			} 
		}
	
	function return_error (err)
		{
			//колбэк для возврата ошибки
			console.log("game daemon error: " + err);
		}

	var sql_query = "SELECT * FROM games WHERE game_state='running'";
	//получаем выборку текущих игр из таблицы games
	var db_res = db.db_query_pro(sql_query, return_result, return_error);
	
	
	}

exports.check_for_full_lobby=check_for_full_lobby;
exports.run_game=run_game;
