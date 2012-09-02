io = require 'socket.io-client'
util = require 'util'
require 'should'
require 'express'
path = require 'path'
request = require 'supertest'

socket_options =
  'force new connection': true # this is necessary for avoiding connection reusing
  #'connect timeout': 200 # ms
  #'reconnect': false
  #'transports': ['websocket']

describe 'pubsub', ->
  shower = null
  beforeEach (done) ->
    shower = require '../app.js'
    request(shower.api_in)
      .get('/namespace.add?namespace=news')
      .expect(200)
      .expect("Successfully applied. namespace 'news'", done)
    return

  afterEach ->
    #debugger
    # clear namespace
    shower.clear()
    shower.destruct()
    delete require.cache[path.resolve('app.js')]
    shower = undefined

  it 'should connects successfully', (done)->
    socket = io.connect 'http://localhost:'+shower.options.shower_listen_port+'/news', socket_options
    socket.on 'news',  (obj) ->
      obj.channel.should.equal 'news'
      obj.message.should.equal 'this is test'
      done()
    socket.on 'connect', ->
      request(shower.api_in)
        .post('/news')
        .send({channel:'news', message:'this is test'})
        .end( (dummy, data) -> data.res.text.should.equal('ok'); )

  it 'should connect multiple channel', (done) ->
    ready_sockets = {"socket1": false, "socket2": false}
    on_connect = (socket_name) ->
      ready_sockets[socket_name] = true;
      return unless ready_sockets["socket1"] && ready_sockets["socket2"]
      request(shower.api_in)
        .post('/news')
        .send({channel:'channel1', message:'this is test'})
        .end (dummy, data)->
          data.res.text.should.equal 'ok'
    
    status_map = 0x00
    socket1 = io.connect 'http://localhost:'+shower.options.shower_listen_port+'/news', socket_options

    socket1.on 'connect', ->
      socket1.on 'channel1', (obj) ->
        status_map ^= 0x01
        on_message()
      socket1.on 'channel2', (obj) ->
        should.fail "this route shouldn't be called"
      on_connect 'socket1'
    socket2 = io.connect 'http://localhost:'+shower.options.shower_listen_port+'/news', socket_options

    socket2.on 'connect', ->
      socket1.on 'channel1', (obj) ->
        status_map ^= 0x04
        on_message()
      socket1.on 'channel2', (obj) ->
        should.fail "this route shouldn't be called"
      on_connect 'socket2'
    
    on_message = () ->
      done() if status_map == 0x05

    
