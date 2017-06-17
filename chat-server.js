// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
// var url = require("url");
// var st = require('node-static');
// var fileServer = new st.Server('./');
/**
 * Global variables
 */
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

var serve = serveStatic("./");
var clients = [ ];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
  var done = finalhandler(request, response);
    serve(request, response, done);
});

server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin);
    var clientCommunication = {
      channel: null,
      connection: connection
    }
    // console.log('connection = ' + connection);
    var index = clients.push(clientCommunication) - 1;
    console.log((new Date()) + ' Connection accepted.');

    var i=0;

    for (var i=0; i < clients.length; i++) {
        if ((clients[i].channel == null) && ( i != index)) {
          var obj1 = {
              whoStarts: '1',
              symbol: '1'
          };

          var obj2 = {
            whoStarts: '0',
            symbol: '0'
          };

            var json1 = JSON.stringify({ type:'start', data: obj1 });
            var json2 = JSON.stringify({ type:'start', data: obj2 });

          clients[index].connection.sendUTF(json1);
          clients[i].connection.sendUTF(json2);
          console.log('Send')
          var channelID = Math.floor(Math.random() * 1000000) + 1;
          clients[i].channel = channelID;
          clients[index].channel = channelID;

          break;
        }
    }

//TODO tablica ze stanem

    // user sent some message
    connection.on('message', function(message) {
      console.log('dostalem wiadomosc');
      //   if (message.type === 'utf8') { // accept only text
      //
      //           console.log((new Date()) + ' Received Message from '
      //                       + userName + ': ' + message.utf8Data);
      //
      //           // we want to keep history of all sent messages
      //           var obj = {
      //               time: (new Date()).getTime(),
      //               text: htmlEntities(message.utf8Data),
      //               author: userName,
      //               color: userColor
      //           };
      //           history.push(obj);
      //           history = history.slice(-100);
        //
        //         // broadcast message to all connected clients
        //         var json = JSON.stringify({ type:'message', data: obj });
        //         for (var i=0; i < clients.length; i++) {
        //             clients[i].sendUTF(json);
        //         }
        //
        // }
    });

    // user disconnected
    connection.on('close', function(connection) {
        // if (userName !== false && userColor !== false) {
        //     console.log((new Date()) + " Peer "
        //         + connection.remoteAddress + " disconnected.");
        //     // remove user from the list of connected clients
        //     clients.splice(index, 1);
        //     // push back user's color to be reused by another user
        //     colors.push(userColor);
        // }
    });

});
