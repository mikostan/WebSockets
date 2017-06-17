$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    var player = null;

    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection
    var connection = new WebSocket('ws://127.0.0.1:1337');

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Choose name:');
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.' } ));
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        var container = document.getElementById('tic-tac-toe-board');
        var nameDiv = document.getElementById('names');
        var yourName = document.getElementById('your-name');
        var oponentName = document.getElementById('oponent-name');

        var startMessage = json.data;
        if (json.type === 'start') { // first response from the server with user's color
          container.style.visibility = 'visible';
          nameDiv.style.visibility = 'visible';
          player = startMessage.symbol;
          yourName.textContent = startMessage.yourName;
          oponentName.textContent = startMessage.oponentName;
          if (startMessage.whoStarts === '0') {
            container.style.pointerEvents = 'none';
            container.style.opacity = '0.5';}
        } else if (json.type === 'move') { // entire message history
          debugger
          container.style.pointerEvents = 'auto';
          container.style.opacity = '1';
          var canvasMousePosition = getCanvasMousePosition(startMessage.clientX, startMessage.clientY);

          if(player === '0') {addPlayingPiece(canvasMousePosition, '1');}
          else {addPlayingPiece(canvasMousePosition, '0');}
          drawLines(10, lineColor);
            }
          else if (json.type === 'winner') {
            var container = document.getElementById('tic-tac-toe-board');
            container.style.pointerEvents = 'none';
            container.style.opacity = '0.5';
            if (symbol === player) {
                alert('You won!');
            }else{
              alert('You lose!');
            }
          }
    };

    function detectWinner (board) {
      var symbol = null;
      for(var x=0;x<2;x++) {
        if ((board[x][0] != '') && board[x][0]==board[x][1]==board[x][2]) symbol=board[x][0];
        else if ((board[0][x] != '') && board[0][x]==board[1][x]==board[2][x]) symbol=board[0][x];
      }
      if((board[0][0] != '') && board[0][0]==board[1][1]==board[2][2] || board[0][2]==board[1][1]==board[2][0]) symbol = board[1][1];

      return symbol;
    }

    canvas.onclick = function (event) {
      var canvasMousePosition = getCanvasMousePosition(event.clientX, event.clientY);
      addPlayingPiece(canvasMousePosition, player);
      drawLines(10, lineColor);
      var container = document.getElementById('tic-tac-toe-board');
      container.style.pointerEvents = 'none';
      container.style.opacity = '0.5';
      debugger
      if((detectWinner(board)!='') && (detectWinner(board) != null)) {
        var symbol = detectWinner(board);
        var obj = {
            symbol: symbol
        };
        var json = JSON.stringify({ type:'winner', data: obj });
        connection.send(json);
        var container = document.getElementById('tic-tac-toe-board');
        container.style.pointerEvents = 'none';
        container.style.opacity = '0.5';
        if (symbol === player) {
            alert('You won!');
        }else{
          alert('You lose!');
        }
      } else {
      var obj = {
          clientX: event.clientX.toString(),
          clientY: event.clientY.toString()
      };
      var json = JSON.stringify({ type:'move', data: obj });
      connection.send(json);
    }
    };


    /**
     * Send mesage when user presses Enter key
     */
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            // send the message as an ordinary text
            connection.send(msg);
            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');

            // we know that the first message sent from a user their name
            if (myName === false) {
                myName = msg;
            }
        }
    });

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                 + 'with the WebSocket server.');
        }
    }, 3000);

    /**
     * Add message to the chat window
     */
    function addMessage(author, message, color, dt) {
        content.prepend('<p><span style="color:' + color + '">' + author + '</span> @ ' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message + '</p>');
    }
});
