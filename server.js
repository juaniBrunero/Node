
let express = require('express');
let fs = require('fs');

let https = require('https');

let app = express();

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
        obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        qrSearched = obj.info.find((tmp) => tmp.name == data);
        console.log((qrSearched == undefined)? "Encontre: " + qrSearched.name : "No encontre");
        delete obj, qrSearched;
      }
    );

    socket.on('qrW', (data) => {

        obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        if(undefined == obj.info.find((tmp) => tmp.name == data)){
          console.log(data);
          obj.info.push(data);
        }
        json = JSON.stringify(obj);
        fs.writeFile('data.json', json, 'utf8', () => console.log("Saved"));
        delete obj, json;
      }
    );

    socket.on('disconnect', () => console.log("Client desconectado: " + socket.id));
  }
);
