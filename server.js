const express = require('express'); 
const bodyParser = require('body-parser'); 
const app = express();
const secureRoutes = express.Router();
var async = require('async');
var jwt = require('jsonwebtoken')
var multer  = require('multer')
var fs = require('fs');
var upload = multer({ dest:'uploads/'})// 'C:/Users/StudUser1/Downloads/Angular/multer' })
process.env.SECRET_KEY = "EVX1CSECRETKEY"
//express.bodyParser({ uploadDir: 'C:/Users/StudUser1/Downloads/Angular' })
app.use(bodyParser.json({limit: "300mb"}));
app.use(bodyParser.urlencoded({limit: "300mb", extended: true, parameterLimit:50000, uploadDir: 'C:/Users/StudUser1/Downloads/Angular'}));
// Adding headers
app.use(function (req, res, next) {
	  var allowedOrigins = ['http://188.237.141.56:4444', 'http://localhost:4200', 'http://localhost', 'http://188.237.141.56','http://acf0e726.ngrok.io','https://acf0e726.ngrok.io','acf0e726.ngrok.io','http://188.237.141.56:2020','http://localhost:4444'];
	  var origin = req.headers.origin;
	  if(allowedOrigins.indexOf(origin) > -1){
	       res.set('Access-Control-Allow-Origin', origin);
			console.log('origin INSIDE : ', origin) 
	  }

    // Request methods you wish to allow
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.set('Access-Control-Allow-Headers', 'token, X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding')

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.set('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use('/secure-api', secureRoutes);

    //---------------------------------------------------------------- Подключение к mySQL
	var mysql = require("mysql")
    var mysqlConfig = {
        host: "localhost",
        user: "root",
        password: "gaguata03",
        database: '1c_database',
        multipleStatements: true

    }
    var connectToDB = function() {
        con = mysql.createConnection(mysqlConfig);
        con.connect(function(err) {
            if (err) {
                console.log('error with connection: ', err)
                setTimeout(connectToDB(), 2000)
            }
            console.log("Connected!");
            con.on('error', function(err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    connectToDB()
                } else {
                    throw err
                }
            })

        });
    }
    connectToDB()
    //----------------------------------------------------------------

function querySql(sql){
    var query = con.query(sql, function(err, rows, fields) {
        if (err) { //throw err;
            console.log("err: ", err);
        };
        var a = JSON.stringify(rows);
        var json = JSON.parse(a);
        var k = json.length;
        console.log('json',json[0].firstname,'k= ',k);	
		return json[0].firstname;
	})
}

secureRoutes.use(function(req, res, next){
	var token = req.body.token || req.headers['token']
	console.log('token', token, ' rb ',req.body)
	if (token){
		jwt.verify(token, process.env.SECRET_KEY, function(err, decode){
			if(err){
                //res.set("bla","bla")
				res.status(500).json({verification:false,speech:"Invalid token"})
			}else{
				next()
			}
		})
	}else{
		res.json({verification:false,speech:"please, send a token"})
	}
	
})
secureRoutes.post('/secure', function(req, res){

	res.json({verification:true})
})

app.post('/sendFile', upload.single('myFileInputField'), function(req, res){
  var tmp_path = req.file.path;

  /** The original name of the uploaded file
      stored in the variable "originalname". **/
  var target_path = 'uploads/' + req.file.originalname;

  /** A better way to copy the uploaded file. **/
  var src = fs.createReadStream(tmp_path);
  var dest = fs.createWriteStream(target_path);
  src.pipe(dest);
  src.on('end', function() { res.render('complete'); });
  src.on('error', function(err) { res.render('error'); });

    console.log('File handling...',req.files)
    res.status(200).json({res:'success!'})

})

app.post('/echo', function(req, res) {
    //console.log("req body\n----------\n",req.body);
    var jsonbody = {};
    var action = req.body && req.body.result && req.body.result.action;
    if(action  == "login"){
        var data = req.body.result.data;
        var email = data.email
        var password = data.passw
        var a;
        async.series([
            function (callback){
                var query = con.query(`SELECT * FROM tbl_user WHERE email = '${email}' AND password = '${password}'`, function(err, rows, fields) {
                    if (err) { console.log("err: ", err); callback(err,null)
                    }else{//throw err; 
                        if(rows.length !== 0){
                            //console.log('From mySQL: ', rows)
                            var json = JSON.parse(JSON.stringify(rows));
                            callback(null, json)
                        }else{
                            var error = 'Нет строк из mySQL с указанными реквизитами'
                            callback(error,null)
                        }
                    }
                })
            }], function (err, results) {
                //console.log(results)
                //console.log('err   ',err)
                if(!err){
                    var username  = results[0][0].firstname // [ [ { firstname: 'Alexandr' } ] ]
                    console.log(username); 
                    var user = {
                        user:results[0][0].firstname,
                        password:results[0][0].email
                    }
                    var token = jwt.sign(user, process.env.SECRET_KEY,{expiresIn:'3h'})
                    console.log("id " ,results[0][0].id, ' token: ',token)
                    jsonbody ={
                        login: true,
                        displayText: ':)',
                        source: 'server',
                        username: username,
                        userid: results[0][0].id,
                        token: token
                    }    
                }else{
                    console.log('func err: ',err)
                    jsonbody ={
                        login: false,
                        speech: "Неудача, попробуйте еще раз",
                        displayText: ':(',
                        source: 'server',
                    }  
                }       
                res.json(jsonbody)
            }
        );
    }else if(req.body.result  == "ObnovlenieBasy"){
        nomenclatureToSQLUpload(req.body.ReplyData, req.body.trigger)
        jsonbody ={
            speech: "uspeh!",
            displayText: 'resultOfquery',
            source: 'EVX web service',
        }
        res.json(jsonbody)
    }else{
         zapros = "Интент не обработан сервером (стандартный ответ)";
         jsonbody ={
             speech: zapros,
             displayText: zapros,
             source: 'server',
         }
         res.json(jsonbody)
    }
})

app.post('/addToCart', function(req, res){

    var user_id = req.body.result.data.user_id
    var nom_id = req.body.result.data.nom_id
    var sklad_id = req.body.result.data.sklad_id
    var count = req.body.result.data.count
    var price_type = req.body.result.data.price_type
    var currency = req.body.result.data.currency
    var code = req.body.result.data.code
    console.log('codeeeee ',code)

    var values = '(\'' + user_id + '\',\'' + nom_id + '\',\'' + sklad_id + '\',\'' + count + '\',\'' + price_type + '\',\''+ currency + '\',\'' + code + '\'); show warnings'
    
    console.log('values:',values)
    var sql = `
        INSERT IGNORE INTO tbl_order(user_id, nom_id, sklad, count, price_type, currency, code)
        VALUES
            ${values}
    `
    var query = con.query(sql, function(err, rows, fields) {
        if (err) { //throw err;
            console.log("err: ", err);
        };
        var a = JSON.stringify(rows);
        var json = JSON.parse(a);
        var k = json.length;
        console.log(json);
        res.json(json);
        //resp.send(rows);
    }); 
})

app.post('/deleteFromCart', function(req, res){
    var user_id = req.body.result.data.user_id
    var nom_id = req.body.result.data.nom_id;
    var sklad_id = req.body.result.data.sklad_id;
    var action = req.body.result.action;
    console.log('user id: ', user_id, 'nom id: ', nom_id, 'sklad id : ', sklad_id, ' action: ', action);
    if (action === 'deleteFromCartAll'){
        var sql = `
            DELETE FROM tbl_order
            WHERE user_id = ${user_id};show warnings
        `
    }else{
         var sql = `
            DELETE FROM tbl_order
            WHERE nom_id = ${nom_id}
            AND user_id = ${user_id}
            AND sklad = ${sklad_id};show warnings
        `       
    }

    var query = con.query(sql, function(err, rows, fields) {
        if (err) { //throw err;
            console.log("err: ", err);
        };
        var json = JSON.parse(JSON.stringify(rows));
        console.log('json ',json);
        console.log("JSON ответотправлен");
        res.json(json);
        //res.send(rows);
    }); 
})

app.post('/sendTo1C', function(req, res){

    if (req.body.result.action === 'sendTo1C'){
        var user_id = req.body.result.data.user_id
        var nom_id = req.body.result.data.nom_id;
        var sklad_id = req.body.result.data.sklad_id;
        var q = req.body.result.data.q;
        console.log('user id: ', user_id, 'nom id: ', nom_id, 'sklad id : ', sklad_id);

        var body = {result:{
            data:{
              user_id : user_id,
              nom_id : nom_id, 
              q : q,
              sklad_id : sklad_id 
            },
            action:'sendTo1C'
          }}

        var options = {
          uri: 'http://localhost:4444/HTTPTest/hs/httpTest/test-parametr/Test/createOrder?param=value',
          method: 'Post',
          headers: {               
            //'Authorization': 'Basic ' + new Buffer("evx.serv1@mail.ru:gaguata03").toString('base64')  
            company:'Eventax',
            name:"alex"              
          },
          json: body,

          auth: {
          user: "Степанов",    //we can auth wia auth or header :)
          password: "ste"
          }
        }
        var request = require("request")
        request(options, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log('response from testHTTP 1c8:', response.body)
            //TelegramBot.Msg("'"+response.body+"'",ToUser);
          res.json(response.body);

          }else{
            let rta = "Error: request1\n"
            console.log(rta, error, " \n ", response)
          }
        })
    }else if(req.body.result.action === 'sendAllTo1C'){
        var user_id = req.body.result.data.user_id
        var arrayOfItems = req.body.result.arrayOfItems
        //console.log('req to create all positions and sort: ', req.body.result)


        body = {result:{
            data:{
              user_id : user_id,
            },
            arrayOfItems: arrayOfItems,
            action:'sendAllTo1C'
          }}

        var options = {
          uri: 'http://localhost:4444/HTTPTest/hs/httpTest/test-parametr/Test/createOrder?param=value',
          method: 'Post',
          headers: {               
            //'Authorization': 'Basic ' + new Buffer("evx.serv1@mail.ru:gaguata03").toString('base64')  
            company:'Eventax',
            name:"alex"              
          },
          json: body,

          auth: {
          user: "Степанов",    //we can auth wia auth or header :)
          password: "ste"
          }
        }
        var request = require("request")
        request(options, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log('response from testHTTP 1c8:', response.body)
            //TelegramBot.Msg("'"+response.body+"'",ToUser);
          res.json(response.body);

          }else{
            let rta = "Error: request1\n"
            console.log(rta, error, " \n ", response)
          }
        })




    }



})

app.get('/getTestAngular', function(req, res) {
    console.log("getTestAngular",req.query.Param)
    var Param = req.query.Param;
    var NumOfPage = req.query.NumOfPage;
    var selectFrom = (NumOfPage - 1) * 20;
    var searchType = req.query.searchType
    console.log('selectFrom ',selectFrom, ' NumOfPage ', NumOfPage,' searchType: ', searchType)

    if(1==1){   


        // var xxx = {
        //  author:'27',
        //  title:'cream for face',
        //  sum:'299'
        // };
            //console.log(req);
            var like = (searchType == '1')  ? `'${ Param }%'` : `'%${ Param }%'`

        //     var sql = `
        //         SELECT SQL_CALC_FOUND_ROWS nom.id, nom.elem, nom.img_url, tbl_amount.number, tbl_sklad.name as sklad,tbl_sklad.id as sklad_id, tbl_sklad.code as code, tbl_price.price, tbl_price.currency, tbl_price.edizm 
        //         FROM tbl_nomenclature AS nom, tbl_amount, tbl_sklad, tbl_price  
        //         WHERE
        //             nom.elem like ${ like }
        //         AND
        //             nom.id = tbl_amount.id_nom
        //         AND
        //             tbl_amount.id_sklad = tbl_sklad.id
        //         AND
        //             tbl_price.id_nom = nom.id
        //         AND
        //             tbl_price.id_price_type = '1'  
        //         Limit ${selectFrom},20; SELECT FOUND_ROWS();      
        // `

            var sql = `
                SELECT SQL_CALC_FOUND_ROWS a.id_nom
                    #, a.number, ' --- ' 
                    #, s.name as 'store name'
                    , n.elem, n.img_url, n.bazov_ed_izm, p.price, p.currency, p.edizm, n.stavkaNDS,  IFNULL(sum(o.count), 0) total_orders_of_this_num
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 1 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Buc' #'Bucuriei 1A'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 2 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Cal' #'Calea Orheului'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 3 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Nijn' #'Нижний_'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 4 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Invent' #'Инвентаризация_'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 5 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'SecTelV' #'2Телецентр Верхний' 
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 6 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Sad' #'Sadovianu'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 7 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Bot' #'Botanica'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 8 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Garan' #'Garantie'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 9 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Serv' #'Service'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 10 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Alfa' #'Alfa'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 11 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'SecTel' #'2Телецентр'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 12 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Tel' #'Телецентр'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 13 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Kod' #'Koditsa'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 14 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Scul' #'Скулянка'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 15 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'VAZ' #'Магазин VAZ'
                    ,IFNULL(SUM(CASE WHEN a.id_sklad = 16 THEN (a.number - IFNULL(o.count, 0)) END), 0) AS 'Vest' #'Vesterniceni'
                FROM  tbl_amount a
                    LEFT JOIN tbl_sklad s on s.id = a.id_sklad
                    LEFT JOIN tbl_nomenclature n ON n.id = a.id_nom 
                    LEFT JOIN tbl_price p ON p.id_price_type = 1 and p.id_nom = a.id_nom 
                    LEFT JOIN tbl_order o on o.nom_id = a.id_nom and o.sklad = a.id_sklad
                Where n.elem LIKE ${ like }
                GROUP BY a.id_nom
                Limit ${selectFrom},20; 
                SELECT FOUND_ROWS();      
        `        
        //console.log(sql)
            var query = con.query(sql, function(err, rows, fields) {
                if (err) { //throw err;
                    console.log("err: ", err);
                };
                var a = JSON.stringify(rows);
                var json = JSON.parse(a);
                var k = json.length;
                console.log(json[0]);
                console.log("JSON ответотправлен");
                console.log("Total rows: ", json[1][0]["FOUND_ROWS()"])
                // for (var i = 0; i < json.length; i++) {
                //     if (json[i].Name == 'крем для рук') {
                //         name = json[i].Name;
                //         console.log(name, ' ', i);
                //     }
                // }
                //console.log("Result: ", json, 'length: ',k);
                //console.log('length: ',k);
                res.json({result:json[0],totalRows:json[1][0]["FOUND_ROWS()"]});
                //resp.send(rows);
            });
    }
    //res.json({ Response: 'You are connected. Congratulations!' });
});


app.get('/getToCart', function(req, res) {
    var user_id = req.query.user_id;
    var price_type = req.query.price_type;
    //var code = req.query.code;
    console.log('user id: ', user_id, 'price type: ', price_type);
    var sql = `

        SELECT o.nom_id, n.elem as nom, o.sklad as sklad_id, s.name as sklad, o.code as code, count, o.price_type as price_type_id, p.elem as price_type, o.currency 
        FROM tbl_order o
        Left join tbl_nomenclature n on nom_id = n.id
        Left join tbl_sklad s on s.id = o.sklad
        Left join tbl_price_type p on p.id = ${price_type}
        WHERE user_id = ${user_id}
        order by o.sklad

    `
    var query = con.query(sql, function(err, rows, fields) {
        if (err) { //throw err;
            console.log("err: ", err);
        };
        var json = JSON.parse(JSON.stringify(rows));
        //console.log('json ',json);
        console.log("JSON ответотправлен");
        res.json(json);
        //res.send(rows);
    });

})

app.get('/storeInfoByNomenclature', function(req, res) {
    var nom = req.query.nom;
    var user = req.query.user;

    //var code = req.query.code;
    console.log('___nom: ', nom, ' user: ', user);
    var sql = `
        select n.elem, a.id_nom, a.number - IFNULL(o.count, 0) number, a.id_sklad, s.name
        from tbl_amount a
        left join tbl_nomenclature n on n.id = a.id_nom
        left join tbl_sklad s on s.id = a.id_sklad
        LEFT JOIN tbl_order o on o.nom_id = a.id_nom and o.sklad = a.id_sklad and o.user_id = ${user}
        where n.id = ${nom}
    `
    var query = con.query(sql, function(err, rows, fields) {
        if (err) { //throw err;
            console.log("err: ", err);
        };
        var json = JSON.parse(JSON.stringify(rows));
        console.log('json ',json);
        console.log("JSON ответотправлен");
        res.json(json);
        //res.send(rows);
    });
    //res.status(200).json({result:{st:'success!'}})

})


const server = app.listen(process.env.PORT || 1980, () => { 
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

//Запросы к mySQL
function sqlquery(sql,arrayFrom1C,trigger){
    //console.log('кол-во аргументов', arguments.length == 2 ? 2 : 1 );
    var start = new Date();
    var mysql = require('mysql');
    var mysqlConfig ={
        host: "localhost",
        user: "root",
        password: "gaguata03",
        database: '1c_database',
        multipleStatements: true,
        connectTimeout:60000
    }
    var con = mysql.createConnection(mysqlConfig);
    var resultOfquery;
    // con.connect(function (err) {
    //     if (err) {
    //      console.log('error with connection: ',err)
    //     }
    //     console.log("Connected!");
    //});
    console.log( start ); 

    if (arguments.length == 1){
        var query = con.query(sql, function(err, result) {
            //con.end();
            if (err) { //throw err;
                console.log("err: ", err);
            }
            if (result != undefined) {
                resultOfquery = result.message;
            } else {
                resultOfquery = 'no result from sql'
            }
            //console.log('test result: ',result)
            var a = JSON.stringify(result);
            //console.log('test a: ',a)
            var json = JSON.parse(a);
            console.log('test json: ',json)
            var k = json.length;
            //console.log('k ',k);
            // console.log('json ',json);
            // При ошибках и предупреждениях в результат добавляется массив с дополнительными данными
            if (json.length >= 2) {
                for (var i = 0; i < json[1].length; i++) {
                    //length = json[0];
                    //name = json[1].length;
                    console.log('Message: ', json[1][i].Message);

                }
                console.log('\n result: ', json[0].message)
            } else {
                console.log('\n result: ', result.message)
            }
        })

    }else if(arguments.length == 3){

        if (trigger == '5') {
            console.log('trigger = 5')

            console.log('arrayFrom1C.length ', arrayFrom1C.length)
            for (var i = 0; i < arrayFrom1C.length; i++) {
                var sql =
                    'INSERT IGNORE INTO tbl_amount (id_nom,id_sklad,number)' +
                    'SELECT \'' + arrayFrom1C[i].nomenclature + '\', tbl_sklad.id, \'' + arrayFrom1C[i].number + '\'' +
                    'FROM  tbl_sklad ' +
                    'WHERE ' +
                    'tbl_sklad.name = \'' + arrayFrom1C[i].sklad + '\'' + '; show warnings'
                var query = con.query(sql, function(err, result) {
                    if (err) { //throw err;
                        console.log("err: ", err);
                    }
                    if (result != undefined) {
                        resultOfquery = result.message;
                    } else {
                        resultOfquery = 'no result from sql'
                    }

                    var a = JSON.stringify(result);
                    var json = JSON.parse(a);
                    var k = json.length;
                    //console.log('k ',k);
                    // console.log('json ',json);
                    // При ошибках и предупреждениях в результат добавляется массив с дополнительными данными                  

                    if (json.length >= 2) {
                       
                        for (var k = 0; k < json[1].length; k++) {
                            //length = json[0];
                            //name = json[1].length;
                            console.log('Message: ', json[1][k].Message, ' nomenclature: ', arrayFrom1C[k].nomenclature, ' sklad: ', arrayFrom1C[k].sklad, ' number: ', arrayFrom1C[k].number);

                        }
                        //console.log('\n result: ',json[0].message)    
                    } else {
                        //console.log('\n result: ',result.message) 
                    }
                })
                if (i == arrayFrom1C.length - 1) {
                    console.log('5 Запросы в цикле прошли без ошибок')
                    var end = new Date()
                    console.log('start: ', start, ' now: ', end)
                }
            }
        }else if(trigger == '6'){
            console.log('trigger = 6')

            for (var i = 0; i<arrayFrom1C.length; i++){
                var sql = 
                    'INSERT IGNORE INTO tbl_price (id_price_type,id_nom,price,date,currency,edizm) '+
                    'SELECT tbl_price_type.id,\''+ arrayFrom1C[i].nomenclature + '\', \''+arrayFrom1C[i].price  +'\',\'' + 
                                                                        arrayFrom1C[i].date         +'\',\'' + 
                                                                        arrayFrom1C[i].currency +'\',\'' + 
                                                                        arrayFrom1C[i].edizm        +'\' ' +
                    'FROM tbl_price_type ' +
                    'WHERE '+// tbl_nomenclature.elem = \''+arrayFrom1C[i].nomenclature+ '\'' +
                    //'AND '+
                    'tbl_price_type.elem = \''+arrayFrom1C[i].price_type+'\''+ '; show warnings'    
                var query = con.query(sql, function (err, result) {
                    if (err) {//throw err;
                        console.log("err: ", err);
                    }
                    if (result != undefined){
                        resultOfquery = result.message;
                    }else{
                        resultOfquery = 'no result from sql'
                    }
                    var a = JSON.stringify(result);
                    var json = JSON.parse(a);
                   var k= json.length;
                   //console.log('k ',k);
                  // console.log('json ',json);
                  // При ошибках и предупреждениях в результат добавляется массив с дополнительными данными
                   if (json.length >= 2){

                    for (var k = 0; k < json[1].length; k++){
                            //length = json[0];
                            //name = json[1].length;
                            console.log('Message: ',json[1][k].Message,' nomenclature: ',arrayFrom1C[k].nomenclature,' price_type: ',arrayFrom1C[k].price_type,' date: ',arrayFrom1C[k].date );
                        
                     }
                    //console.log('\n result: ',json[0].message)    
                    }else{
                        //console.log('\n result: ',result.message) 
                    }
                })
                if(i == arrayFrom1C.length-1){
                  console.log('6 Запросы в цикле прошли без ошибок')
                    var end = new Date()
                    console.log( 'start: ',start, ' now: ',end )              
                }
            }
        }
    }
   // con.end();
}

//Выгрузка цен, остатков, складов и др. из 1С 
function nomenclatureToSQLUpload(arrayFrom1C, trigger){
    // Номенклатура
    if (trigger == '1') {
        var queryString = ''
        console.log('Загрузка номенклатуры успешно запущена. N= ', arrayFrom1C.length)
        for (var i = 0; i < arrayFrom1C.length; i++) {
            //console.log(arrayFrom1C[i].P,arrayFrom1C[i].Name,arrayFrom1C[i].Q);

            var elem = arrayFrom1C[i].elem;
            var id = arrayFrom1C[i].id;

            if (~elem.indexOf('\'')) {
                console.log('elem', elem)
                elem = elem.replace(/\'/g, '\\\''); 
            }
            //console.log(elem.indexOf('\''))
            var comment = arrayFrom1C[i].comment;
            if (comment == 'null') {
                comment = null
            } else if (comment.indexOf('\'') >= 0) {
                console.log('comment1', comment)
                comment = comment.replace(/\'/g, '\*')
                console.log('comment1after', comment)
                if (~comment.indexOf('\\')) {
                    comment = comment.replace(/\\/g, '\\\\');
                    //console.log(comment.indexOf('\''))
                }
            } else if (comment.indexOf('\\') >= 0) {
                comment = comment.replace(/\\/g, '\\\\');
                console.log('comment2', comment)
                if (~comment.indexOf('\'')) {
                    comment = comment.replace(/\'/g, '\\\'')
                }
                //console.log(comment.indexOf('\''))
            }
            var bazov_ed_izm = arrayFrom1C[i].bazov_ed_izm;
            if (bazov_ed_izm == 'null') {
                bazov_ed_izm = null
            } else if (~bazov_ed_izm.indexOf('\'')) {
                console.log('bazov_ed_izm', bazov_ed_izm)
                bazov_ed_izm = bazov_ed_izm.replace(/\'/g, '\*');
            }

            var stavkaNDS = arrayFrom1C[i].stavkaNDS
            if (stavkaNDS == 'null') {
                stavkaNDS = null
            } else if (~stavkaNDS.indexOf('\'')) {
                console.log('stavkaNDS', stavkaNDS)
                stavkaNDS = stavkaNDS.replace(/\'/g, '\\\'');
            }
            // console.log(stavkaNDS.indexOf('\''))

            var nomenkl_gruppa = arrayFrom1C[i].nomenkl_gruppa
            if (nomenkl_gruppa == 'null') {
                nomenkl_gruppa = null
            } else if (~nomenkl_gruppa.indexOf('\'')) {
                console.log('nomenkl_gruppa', nomenkl_gruppa)
                nomenkl_gruppa = nomenkl_gruppa.replace(/\'/g, '\\\'');
            }
            //console.log(nomenkl_gruppa.indexOf('\''))

            var vid_nomenkl = arrayFrom1C[i].vid_nomenkl
            if (vid_nomenkl == 'null') {
                vid_nomenkl = null
                //console.log(vid_nomenkl)
            } else if (~vid_nomenkl.indexOf('\'')) {
                console.log('vid_nomenkl', vid_nomenkl)
                vid_nomenkl = vid_nomenkl.replace(/\'/g, '\\\'');
            }
            //console.log(vid_nomenkl.indexOf('\''))

            var img_url = arrayFrom1C[i].img_url
            if (img_url == 'null') {
                img_url = null
                //console.log(vid_nomenkl)
            } else if (~img_url.indexOf('\'')) {
                console.log('img_url', img_url)
                img_url = img_url.replace(/\'/g, '\\\'');
            }else if (~img_url.indexOf('\\')) {
                img_url = img_url.replace(/\\/g, '\\\\');
                //console.log(img_url.indexOf('\''))
            }


            //console.log(vid_nomenkl.indexOf('\''))

            // elem = null      
            // queryString = queryString + '(\''+q+'\',\''+name+'\',\''+p+'\'),'
            //queryString = queryString + '(' + id + ',\'' + elem + '\',\'' + comment + '\',\'' + bazov_ed_izm + '\',\'' + stavkaNDS + '\',\'' + nomenkl_gruppa + '\',\''+ vid_nomenkl + '\',\'' + img_url + '\'),'
            queryString = `${queryString} (${id}, '${elem}', '${comment}', '${bazov_ed_izm}', '${stavkaNDS}', '${nomenkl_gruppa}', '${vid_nomenkl}', '${img_url}'),`
            // console.log('queryString ',queryString)
            // console.log('nomenclature: ',elem ,
            //      ' ',comment,
            //      ' ',bazov_ed_izm,
            //      ' ', stavkaNDS, 
            //      ' ', nomencl_gruppa,
            //      ' ', vid_nomencl
            //  )   
        }
        queryString = queryString.substring(0, queryString.length - 1) + '; show warnings';
        //queryString = queryString.replace(/\'/g, '\\\'');
        var sql = `INSERT IGNORE INTO tbl_nomenclature
            (id, elem, comment, bazov_ed_izm, stavkaNDS, nomenkl_gruppa, vid_nomenkl,img_url)
            VALUES
            ${queryString}`
        //console.log (queryString)     
        sqlquery(sql);
        // Тип цен
    }else if(trigger =='2') {
        console.log('триггер переключен в режим 2')
        var queryString =''
        for(var i = 0; i < arrayFrom1C.length; i++){
            queryString = queryString + '(\'' + arrayFrom1C[i].elem + '\'),'
        }
        //Вырезаем всю строку до последней запятой
        queryString = queryString.substring(0,queryString.length - 1)+ '; show warnings';

        var sql = `INSERT IGNORE INTO tbl_price_type
            (elem)
            VALUES
            ${queryString}`
            //console.log (queryString)     
        sqlquery(sql);
    // тип складов
    }else if(trigger =='3') {
        var queryString =''
        console.log('Типы складов')
        console.log(arrayFrom1C.length)
        for (var i = 0; i<arrayFrom1C.length; i++){
            // console.log('code ',arrayFrom1C[i].code,'name ',arrayFrom1C[i].name)
            console.log('name ',arrayFrom1C[i])
            queryString = queryString + '(\''+arrayFrom1C[i]+ '\'),'
        }
        queryString = queryString.substring(0,queryString.length - 1)+ '; show warnings';
        var sql = `INSERT IGNORE INTO tbl_sklad_type
            (type)
            VALUES
            ${queryString}`
            //console.log (queryString)     
        sqlquery(sql);
    // Склады
    }else if(trigger =='4') {
        var queryString =''
        console.log('Склады')
        //console.log(arrayFrom1C.length)
        for (var i = 0; i<arrayFrom1C.length; i++){
            console.log('code ',arrayFrom1C[i].code,'name ',arrayFrom1C[i].name, 'type ',arrayFrom1C[i].type)
            var sql = 
                'INSERT IGNORE INTO tbl_sklad (name,code,type_id)'+
                'SELECT \''+arrayFrom1C[i].name+'\', \''+arrayFrom1C[i].code+'\', tbl_sklad_type.id '+
                'FROM tbl_sklad_type '+
                'WHERE tbl_sklad_type.type = \''+arrayFrom1C[i].type+'\''+ '; show warnings'    
            sqlquery(sql);
            }
            //console.log (queryString)     
    // Остатки
    }else if(trigger =='5') {
        //var queryString =''

        sqlquery(sql,arrayFrom1C,trigger);  

        console.log('Остатки')
        console.log('Итого строк: ',arrayFrom1C.length)
    // Цены
    }else if(trigger =='6') {
        sqlquery(sql,arrayFrom1C,trigger);  
        console.log('Цены')
        console.log('Итого строк: ',arrayFrom1C.length)
    }else if(trigger =='8') {
            var sql = 
                `INSERT IGNORE INTO tbl_user (email,password,type_price,company,firstname,lastname)
                 VALUES
                 ('${arrayFrom1C[0].email}','${arrayFrom1C[0].password}','${arrayFrom1C[0].type_price}','${arrayFrom1C[0].company}','${arrayFrom1C[0].firstname}','${arrayFrom1C[0].lastname}');
                 show warnings` 
            sqlquery(sql);
    }
}