let socket;

let dif = 10;
let ancho;
let alto;

let bot = {};
let vid = {};

let cont = 0;

const codeReader = new ZXing.BrowserQRCodeReader();

function setup() {

  socket = io.connect('https://10.10.3.169:3000');

  //MSJ DE RECEPCION
  socket.on('recb', (data) => console.log("Recibido"));

  ancho = windowWidth;
  alto = windowHeight;

  createCanvas(ancho, alto);

  bot.ancho = (ancho - 3 * dif) / 2;
  bot.alto = (alto - 3 * dif) / 8;

  vid.ancho = bot.ancho
  vid.alto = bot.alto*3

  select('video').position(dif, 2*dif+bot.alto);
  select('video').size(vid.ancho, vid.alto);
}

function draw() {
  background(51);
  drawMenu();
}

function mouseClicked(){
  let data = undefined;
  if(mouseTouch(dif, dif, dif + bot.ancho, dif + bot.alto)){
    scanLook();
  }else if(mouseTouch(2 * dif + bot.ancho, dif, 2 * (dif + bot.ancho), dif+bot.alto)){
    scanSearch();
  }
  if(data != undefined){
    socket.emit('send', data);
    console.log(data);
  }
}

function mouseTouch(xm, ym, xM, yM){
  return xm < mouseX && mouseX < xM && ym < mouseY && mouseY < yM
}

function drawMenu(){
  fill(255);
  rect(dif, dif, bot.ancho, bot.alto);
  rect(2 * dif + bot.ancho, dif, bot.ancho, bot.alto);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
  ancho = windowWidth;
  alto = windowHeight;
  bot.ancho = (ancho - 3 * dif) / 2;
  bot.alto = (alto - 3 * dif) / 8;
}

function scanLook(){
  codeReader
    .decodeFromInputVideoDevice(undefined, 'video')
    .then(result => {socket.emit('qrS', result.text)})
    .catch(err => console.error(err));
}

function scanSearch(){
  codeReader
    .decodeFromInputVideoDevice(undefined, 'video')
    .then(result => {socket.emit('qrW', {name:result.text})})
    .catch(err => console.error(err));
}
