var express = require('express');
var path = require('path');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var configJson = require('config.json');
var program = require('commander');
//var session = require('express-session');
//var RedisStore = require('connect-redis')(session);
var log4js = require('log4js');

var redisClient = require('./utils/redis.js');
var ProtoHandler = require('./service/manager/protoHandler.js');
var protoManager = require('./service/manager/protoManager.js');

var mysqlManager = require('./service/dao/mysqlManager.js');
var confManager = require('./service/manager/confManager.js');

var log = require('./utils/log.js');

var routes = require('./routes/index');
var proto = require('./routes/proto.js');
var platform = require('./routes/platform.js');
var gm = require('./routes/gm.js');

var app = express();

program.version('0.0.1')
	   .option("-p --port [port]", "Listen Port")
	   .option("-h --help", "Output usage");

program.parse(process.argv);
//log4js.configure("./config/log4js.json");

log4js.configure({
    "appenders": [
        {"type" : "console", "category" : "console"},
        {
            "type": "dateFile",
            "filename": "log/"+program.port+"/gameserver_",
            "pattern" : "yyyyMMdd.log",
            "alwaysIncludePattern": true,
            "maxLogSize": 20480,
            "backups": 10,
            "category": "logInfo"
        }
    ],
    "levels" : {"logInfo" : "DEBUG"},
    "replaceConsole" : true
});

var logger = log4js.getLogger("logInfo");
logger.debug("test log4js");

//init logger
app.set("logger", logger);
log.init(app, logger);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
//add rawBody to req
//app.use(function(req, res, next) {
//    var data = '';
//    req.setEncoding('utf8');
//    req.on('data', function(chunk) {
//        data += chunk;
//    });
//    req.on('end', function() {
//        req.rawBody = data;
//        next();
//    });
//});

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

confManager.initConf();

//设置session地址
//var RedisStore = require('connect-redis')(session);
//app.use(session({
//    store : new RedisStore({
//        host : app.get('redis').host,
//        port : app.get('redis').port,
//        ttl  : 3600,
//        db : 2
//    }),
//    secret : 'keyboard cat',
//    resave : false,
//    saveUninitialized : false,
//    cookie: {
//        //secure: true,
//        path : "/",
//        httpOnly : true,
//        signed : false,
//        expires : false
//    }
//}));

app.use('/', routes);
app.use('/proto', proto);
app.use('/gm', gm);
app.use('/platform', platform);

var listen_port = program.port;


//store mysql pool to app
mysqlManager.init(app);

var redisClient = redisClient.init(app);
if (redisClient == null) {
    logger.error("init redis failed");
    process.exit(1);
}

logger.info("init redis success");

var protoHandler = new ProtoHandler(app);
protoManager.init(protoHandler);

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
    logger.error(err);
    console.log(err);
});

module.exports = app;
