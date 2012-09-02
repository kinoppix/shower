module.exports = {
  // Shower Server
  'shower_listen_port': 10080,
  'shower_listen_address': '0.0.0.0',   //use '0.0.0.0' to accept all connections

  // Inner API
  'api_listen_port': 10081,
  'api_listen_address': '0.0.0.0',  // private IP address or loopback

  // Redis Master
  'redis_master_address': '127.0.0.1',
  'redis_master_passwd': '',
  'redis_master_port': 6379,  //default is 6379

  // Redis Slave
  'redis_slave_address': '127.0.0.1',
  'redis_slave_passwd': '',
  'redis_slave_port': 6379,  //default is 6379

  // Socket.IO Log Level
  'socketio_loglevel': 0,

  // save namespaces to redis
  'redis_namespace_key': '__shower_test',

};

