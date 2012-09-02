/* vim: ts=2:sw=2:expandtab:autoindent:number */
var options = require('config');
var redis = require('redis')
  , express = require('express')
  , io = require('socket.io')
  , fs = require('fs')
  , util = require('util')
  , http = require('http')
  , _ = require('underscore');
var socket;


var onPublish = function(req, res){
  console.log("publish: " + req.route.path + " : " + util.inspect(req.body));
  res.header("Access-Control-Allow-Origin", "*");
  var namespace = req.route.path.substring(1);
  pub.publish(namespace+':'+req.body.channel, JSON.stringify(req.body));
  res.send('ok');
};
var add_namespace = function(namespace){
  pub.sadd(options.redis_namespace_key, namespace);
  socket.of('/'+namespace);
  sub.psubscribe(namespace+':*');
  api_in.post('/'+namespace, onPublish);
}
var remove_namespace = function(namespace){
  pub.srem(options.redis_namespace_key, namespace);
  var sockets = socket.of('/'+namespace).sockets;
  if(!_.isEmpty(sockets)){
    sockets.forEach(
      function(socket, i){ socket.disconnect();}
      );
  }
  sub.punsubscribe(namespace+':*');
  api_in.remove('/'+namespace, 'post');
}
var restore_namespace = function(){
  pub.smembers(options.redis_namespace_key, function(err, res) {
    if(!_.isEmpty(res)){
      res.forEach(function(namespace){
        add_namespace(namespace);
      });
    }
  });
};

var clear_namespace = function(){
  pub.del(options.redis_namespace_key);
}

var pub = redis.createClient(options.redis_master_port, options.redis_master_address); if (options.redis_master_passwd) { pub.auth(options.redis_master_passwd) }
var sub = redis.createClient(options.redis_slave_port, options.redis_slave_address); if (options.redis_slave_passwd) { sub.auth(options.redis_slave_passwd) }
sub.on("pmessage", function(pattern, channel, json) {
  console.log("pmessage: " + channel);
  var _ref = channel.split(':', 2);
  var namespace = _ref[0];
  var channel = _ref[1];
  socket.of('/'+namespace).volatile.emit(channel, JSON.parse(json));
});

var api_in = express();
api_in.use(express.bodyParser());
var http_api_in = http.createServer(api_in).listen(options.api_listen_port, options.api_listen_address);

// create http server to specify listen address and port
var http_shower_in = http.createServer().listen(options.shower_listen_port, options.shower_listen_address);
http_shower_in.on('request', function (req, res) {
  res.writeHead(200);
  res.end('Welcome to socket.io.');
});
socket = io.listen(http_shower_in);
socket.set('log level', options.socketio_loglevel);
restore_namespace();

api_in.get('/namespace.add', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  add_namespace(req.query.namespace);
  res.send('Successfully applied. namespace \''+req.query.namespace+'\'');
  console.log("add namespace: "+req.query.namespace);
});

api_in.get('/namespace.remove', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  remove_namespace(req.query.namespace);
  res.send('Successfully applied. namespace \''+req.query.namespace+'\'');
  console.log("remove namespace: "+req.query.namespace);
});

exports.api_in = api_in;
exports.options = options;
exports.clear = clear_namespace;
exports.destruct = function(){
  socket.server.close();
  pub.quit();
  sub.quit();
  pub = undefined;
  sub = undefined;
  http_api_in.close();
  http_api_in = undefined;
  http_shower_in = undefined;
  api_in = undefined;
}
