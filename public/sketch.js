let socket;

let dif = 10;
let ancho;
let alto;

let bot = {};

let query = {};

let mode = 0;

const codeReader = new ZXing.BrowserQRCodeReader();

let botonT = {};
let botonesPC = {};

let lastData = "Error"

function setup() {

  socket = io.connect('https://192.168.0.5:3000');
  //socket = io.connect('https://10.10.3.169:3000');

  //MSJ DE RECEPCION
  socket.on('recb'   , (data) => console.log("Recibido"));
  socket.on('saved'  , (data) => (data == "Ya estaba")? lastData = "YES" : console.log(data));
  socket.on('mod'    , (data) => (data == "No estaba")? lastData = "Not" : console.log(data));
  socket.on('qrSList', (data) => {console.log(data);lastData = data});

  ancho = windowWidth;
  alto = windowHeight;

  createCanvas(ancho, alto);

  bot.ancho = (ancho - 3 * dif) / 2;
  bot.alto = (alto - 3 * dif) / 8;

  select('video').position(dif, 2*dif + bot.alto);
  select('video').size(max(select('video').width, bot.ancho), max(select('video').height, bot.ancho));

  preparar(botonT, 20, 5, "Siguiente", "Tipo dispositivo");
  botonT.buttonT.mousePressed(typeSet);

  prepararPC(botonesPC, 20, 5, "Guadar", "Descripcion Pc");
  botonesPC.buttonPC.mousePressed(typePc);
}

function draw() {
  background(51);
  switch (mode) {
    case 0:
      drawMenu();
      if(lastData != "Error"){
        verData(lastData);
      }
      break;
    case 1:
      completeMenu();
      break;
    case 2:
      completarPC();
    default:
  }
}

function mouseClicked(){
  let data = undefined;
  if(mode == 0){
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
}

function mouseTouch(xm, ym, xM, yM){
  return xm < mouseX && mouseX < xM && ym < mouseY && mouseY < yM
}

function drawMenu(){
  fill(255);
  rect(dif, dif, bot.ancho, bot.alto);
  rect(2 * dif + bot.ancho, dif, bot.ancho, bot.alto);
  textSize(18);
  fill(0);
  text("ESCANEAR", bot.ancho/2 - 4*dif, dif + bot.alto / 2);
  text("MODIFICAR", bot.ancho + bot.ancho/2 - 3*dif, dif + bot.alto / 2);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
  ancho = windowWidth;
  alto = windowHeight;
  bot.ancho = (ancho - 3 * dif) / 2;
  bot.alto = (alto - 3 * dif) / 8;
}

function scanLook(){
  select('video').show();
  codeReader
    .decodeFromInputVideoDevice(undefined, 'video')
    .then(result => {socket.emit('qrS', result.text);
                     fill(255);
                     text(result.text, ancho/2, 2*dif+bot.alto);})
    .catch(err => console.error(err));
}

function scanSearch(){
  select('video').show();
  codeReader
    .decodeFromInputVideoDevice(undefined, 'video')
    .then(result => {cambiarModo(1); query.name = result.text;})
    .catch(err => console.error(err));
}

function completeMenu(){
  background(51);
  botonT.typeT.show();
  botonT.buttonT.show();
  botonT.greetingT.show();
  select('video').hide();
  if(query.type != undefined){
    if(query.type == "PC"){
      cambiarModo(2);
    }else if(query.type == "DEL"){
      socket.emit('qrD', query.name);
      cambiarModo(0);
    }else{
      cambiarModo(4);
    }
    botonT.typeT.hide();
    botonT.buttonT.hide();
    botonT.greetingT.hide();
  }
}

function completarPC(){
  background(51);
  botonesPC.saidIP.show();
  botonesPC.typeIP.show();
  botonesPC.saidNombre.show();
  botonesPC.typeNombre.show();
  botonesPC.saidMother.show();
  botonesPC.typeMother.show();
  botonesPC.saidSSD.show();
  botonesPC.typeSSD.show();
  botonesPC.saidLugar.show();
  botonesPC.typeLugar.show();
  botonesPC.buttonPC.show()
  select('video').hide();
  if(query.ip != undefined){
    cambiarModo(0);
    socket.emit('qrW', query);
    query = {};
    lastData = "Error";
    botonesPC.saidIP.hide();
    botonesPC.typeIP.hide();
    botonesPC.saidNombre.hide();
    botonesPC.typeNombre.hide();
    botonesPC.saidMother.hide();
    botonesPC.typeMother.hide();
    botonesPC.saidSSD.hide();
    botonesPC.typeSSD.hide();
    botonesPC.saidLugar.hide();
    botonesPC.typeLugar.hide();
    botonesPC.buttonPC.hide();
  }
}

function cambiarModo(m){
  mode = m;
}

function preparar(b, x, y, bot, val){
  b.typeT = createInput();
  b.typeT.position(x, y+60);

  b.buttonT = createButton(bot);
  b.buttonT.position(x+190, y+60);

  b.greetingT = createElement('h2', val);
  b.greetingT.position(x, y);
  b.greetingT.style('color:#FFFFFF');

  b.typeT.hide();
  b.buttonT.hide();
  b.greetingT.hide();
}

function prepararPC(b, x, y, bot, val){
  b.saidIP = createElement('h2', "IP: ");
  b.saidIP.position(x, y);
  b.saidIP.style('color:#FFFFFF');

  b.typeIP = createInput();
  b.typeIP.position(x+120, y+20);

  b.saidNombre = createElement('h2', "NOMBRE: ");
  b.saidNombre.position(x, y+30);
  b.saidNombre.style('color:#FFFFFF');

  b.typeNombre = createInput();
  b.typeNombre.position(x+120, y+50);

  b.saidMother = createElement('h2', "MOTHER: ");
  b.saidMother.position(x, y+60);
  b.saidMother.style('color:#FFFFFF');

  b.typeMother = createInput();
  b.typeMother.position(x+120, y+80);

  b.saidSSD = createElement('h2', "SSD: ");
  b.saidSSD.position(x, y+90);
  b.saidSSD.style('color:#FFFFFF');

  b.typeSSD = createInput();
  b.typeSSD.position(x+120, y+110);

  b.saidLugar = createElement('h2', "LUGAR: ");
  b.saidLugar.position(x, y+120);
  b.saidLugar.style('color:#FFFFFF');

  b.typeLugar = createInput();
  b.typeLugar.position(x+120, y+140);

  b.buttonPC = createButton(bot);
  b.buttonPC.position(x+320, y+140);

  b.saidIP.hide();
  b.typeIP.hide();
  b.saidNombre.hide();
  b.typeNombre.hide();
  b.saidMother.hide();
  b.typeMother.hide();
  b.saidSSD.hide();
  b.typeSSD.hide();
  b.saidLugar.hide();
  b.typeLugar.hide();
  b.buttonPC.hide();
}

function typeSet(){
  query.type = botonT.typeT.value();
}

function typePc(){
  query.ip = botonesPC.typeIP.value();
  query.nombre = botonesPC.typeNombre.value();
  query.mother = botonesPC.typeMother.value();
  query.ssd = botonesPC.typeSSD.value();
  query.lugar = botonesPC.typeLugar.value();
}

function verData(data){
  textSize(18);
  fill(255);
  if(data == "Not"){
    text("No encontrado", ancho/2 + dif, 5*dif+bot.alto);
  }else if(data == "YES"){
    text("Ya se encuentra", ancho/2 + dif, 5*dif+bot.alto);
  }else if(data.type == "PC"){
    text(data.name  , ancho/2+ dif,  5*dif+bot.alto);
    text(data.type  , ancho/2+ dif,  8*dif+bot.alto);
    text(data.ip    , ancho/2+ dif, 11*dif+bot.alto);
    text(data.nombre, ancho/2+ dif, 14*dif+bot.alto);
    text(data.ssd   , ancho/2+ dif, 17*dif+bot.alto);
    text(data.lugar , ancho/2+ dif, 20*dif+bot.alto);
  }else{
    text(data.name, ancho/2+ dif, 5*dif+bot.alto);
    text(data.type, ancho/2+ dif, 6*dif+bot.alto);
  }
}
