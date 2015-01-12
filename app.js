
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

// express
var app = express();

// DB connection
var mysql = require('mysql');
var poolCluster = mysql.createPoolCluster();

dbconfig = {
        "host"                  : "localhost",
        "database"              : "infoProject",
        "user"                  : "root",
        "password"              : "chang",
        "multipleStatements"    : true,
        "connectionLimit"       : 10,
        "waitForConnection"     : false
}
poolCluster.add('INFO', dbconfig);
global.INFO_Pool = poolCluster.of('INFO');

// all environments
app.set('port', process.env.PORT || 8009);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser({ uploadDir: __dirname+'/public/images/board'}));
app.use(express.session({
  secret: "rladudtjd"
}));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// rootPage CRUD
app.get('/', loadUser, routes.index);
app.post('/create', loadUser, routes.createInfo);
app.get('/read/:page([0-9]+)/cat/:category([a-z_A-Z]+)', routes.readInfo);
app.get('/read/detail/:id([0-9]+)', loadUser, routes.detailInfo);
app.post('/update/:page([0-9]+)', loadUser, routes.updateInfo);
app.post('/delete/:page([0-9]+)', loadUser, routes.deleteInfo);

// keyword CRUD
app.get('/keyword/:page([0-9]*)', loadUser, routes.keyword);

// log CRUD
app.get('/log/:page([0-9]*)', loadUser, routes.log);

//app.get('/login', routes.login);
//app.get('/users', user.list);

app.post('/login', routes.login);
app.get('/logout', loadUser, routes.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// route middle
function loadUser(req, res, next){
  if(req.session.user_id){
    // finduserid
    req.currentUser = req.session.user_id;
    // next();
  } else{
  }
  next();
}














