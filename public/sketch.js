let socket;

let dif = 10;
let ancho;
let alto;

let video;

function setup() {

  socket = io.connect('http://10.10.3.169:3000');

  //MSJ DE RECEPCION
  socket.on('recb', (data) => console.log("Recibido"));

  noLoop();

  video = createCapture(VIDEO);
  video.size(min(480, windowWidth - 2 * dif), min(480, (windowHeight - 2 * dif - windowHeight/8)));
  video.position(dif, 4*dif);
  createCanvas(windowWidth, windowHeight);
  setInterval(scan, 500);
}

function draw() {
  background(51);
  ancho = (windowWidth - 3 * dif) / 2;
  alto = windowHeight / 8;
  drawMenu();
}

function scan(){
  video.loadPixels();
  let data = jsQR(video.pixels, video.width, video.height);
  if(data != null){
    console.log(data);
  }else{
    console.log("No data");
  }
}

function mouseClicked(){
  let data = undefined;
  if(mouseTouch(dif, dif + ancho, dif ,dif + alto)){
    data = "Bot1";
    scan();
  }else if(mouseTouch(2*dif + ancho, 2*dif + 2*ancho, dif, dif + alto)){
    data = "Bot2";
  }
  if(data != undefined){
    socket.emit('send', data);
    console.log(data);
  }
}

function mouseTouch(xm, xM, ym, yM){
  return xm < mouseX && mouseX < xM && ym < mouseY && mouseY < yM
}

function drawMenu(){
  fill(255);
  rect(dif, dif, ancho, alto);
  rect(ancho + 2 * dif, dif, ancho, alto);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
  video.size(min(480, windowWidth - 2 * dif), min(480, (windowHeight - 2 * dif - windowHeight/8)));
}
