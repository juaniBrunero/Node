
let express = require('express');
let fs = require('fs');
var mysql = require("mysql");

let https = require('https');

let app = express();

let server = https.createServer({
  key:  fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(3000, function() {
  console.log('Listen server')
})

let connected = false;

var con = mysql.createConnection({
  host: "10.10.2.195",
  port: "32768",
  user: "root",
  password: "sanluis2019"
});

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
    });

    socket.on('qrS', (data) => {
      socket.emit('recb', "ok");
      if (connected){
        con.query("SELECT * FROM info WHERE nam =" + data, function (err, result, fields) {
          if (err) console.log(err);
          if (result.length == 1){
            console.log("Encontre: " + result[0].nam);
            socket.emit('qrSList', result[0]);
          }else{
            console.log("No encontre");
            socket.emit('qrSList', "Not");
          }
          delete result;
        });
      }else{
        connectDB(con);
        console.log("Error DB");
        socket.emit('qrSList', "Error");
      }
    });

    socket.on('qrW', (data) => {

        obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        if(undefined == obj.info.find((tmp) => tmp.name == data.name)){
          console.log(data);
          obj.info.push(data);
          socket.emit('saved', data);
        }else{
          socket.emit('saved', "Ya estaba");
        }
        json = JSON.stringify(obj);
        fs.writeFile('data.json', json, 'utf8', () => console.log("Saved"));
        delete obj, json;
      }
    );

    socket.on('qrA', (data) => {

        obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        if(undefined != obj.info.find((tmp) => tmp.name == data.name)){
          console.log(data);
          obj.com.push(data);
          socket.emit('mod', data);
        }else{
          socket.emit('mod', "No Estaba");
        }
        json = JSON.stringify(obj);
        fs.writeFile('data.json', json, 'utf8', () => console.log("Saved"));
        delete obj, json;
      }
    );

    socket.on('qrD', (data) => {

        obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        console.log(obj.info.find((tmp) => tmp.name == data));
        if(undefined != obj.info.find((tmp) => tmp.name == data)){
          obj.info.splice(obj.info.findIndex((i) => i.name === data), 1);
          while(undefined != obj.com.find((tmp) => tmp.name == data)){
            obj.com.splice(obj.com.findIndex((i) => i.name === data), 1);
          }
          socket.emit('saved', data);
        }else{
          socket.emit('saved', "No estaba");
        }
        json = JSON.stringify(obj);
        fs.writeFile('data.json', json, 'utf8', () => console.log("Saved"));
        delete obj, json;
      }
    );

    socket.on('disconnect', () => console.log("Client desconectado: " + socket.id));
  }
);

function connectDB(db){
  try{
    db.connect();
    db.query("USE inventariopc");
    connected = true;
  }catch(e){
    console.log(e);
    connected = false;
  }
}
