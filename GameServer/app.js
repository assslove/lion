var express = require('express');
var path = require('path');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var configJson = require('config.json');
var program = require('commander');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var log4js = require('log4js');
log4js.configure("./config/log4js.json");

var logger = log4js.getLogger("logInfo");
logger.debug("test log4js");


program.version('0.0.1')
	   .option("-p --port [port]", "Listen Port")
	   .option("-h --help", "Output usage");

program.parse(process.argv);

var mysqlClient = require('./service/dao/mysql_cli.js');
var redisClient = require('./utils/redis.js');
var protoHandler = require('./service/protoHandler.js');
var mysqlManager = require('./service/dao/mysqlManager.js');
var log = require('./utils/log.js');

var routes = require('./routes/index');

var app = express();

//init logger
app.set("logger", logger);
log.init(app, logger);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// load  config
if (app.get('env') == "development") {
    app.set('mysql', configJson('config/mysql.json', app.get('env')).development);
    app.set('redis', configJson('config/redis.json', app.get('env')).development);
    app.set('server', configJson('config/server.json', app.get('env')).development);
} else {
    app.set('mysql', configJson('config/mysql.json', app.get('env')).production);
    app.set('redis', configJson('config/redis.json', app.get('env')).production);
    app.set('server', configJson('config/server.json', app.get('env')).production);
}

app.use(session({
    store : new RedisStore({
        host : app.get('redis').host,
        port : app.get('redis').port,
        ttl  : 3600,
        db : 2
    }),
    secret : 'keyboard cat',
    resave : false,
    saveUninitialized : false,
    cookie: {
        //secure: true,
        path : "/",
        httpOnly : true,
        signed : false,
        //maxAge : 3600 * 24 * 7,
        expires : false
    }
}));

app.use('/', routes);
//app.use('/client_tool', client_tool);

var listen_port = program.port;


//store mysql pool to app
mysqlManager.init(app);

var redisCli = redisClient.init(app);
if (!!redisCli) {
	logger.info("redis init success");
	app.set("redisclient", redisCli);
}

protoHandler.init(app);

var server = app.listen(listen_port, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("listen on http://%s:%d", host, port);
});

app.use(function (req, res, next) {
    if (!req.session) {
        return next(new Error('oh no'));
    }
    next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

process.on('uncaughtException', function (err) {
    console.log(err);
});

module.exports = app;
