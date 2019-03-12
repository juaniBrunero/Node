
let express = require('express');
let fs = require('fs');

let https = require('https');

let app = express();

//let server = app.listen(process.env.PORT || 3000, listen);

let server = https.createServer({
  key:  fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
}, app).listen(3000, function() {
  console.log('Listen server')
})


function listen() {
  let host = server.address().address;
  let port = server.address().port;
}

app.use(express.static('public'));

let io = require('socket.io')(server);

io.sockets.on('connection', (socket) => {

    console.log("Cliente nuevo: " + socket.id);

    socket.on('send', (data) => {

        socket.emit('recb', "ok");
        console.log("Recibido");

      }
    );

    socket.on('qrS', (data) => {

        socket.emit('recb', "ok");
        console.log(data);

      }
    );

    socket.on('disconnect', () => console.log("Client desconectado: " + socket.id));
  }
);
