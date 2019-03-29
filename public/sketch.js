
let socket;

let dif = 10;
let ancho;
let alto;

let bot = {};

let query = {};

let mode = 0;

const codeReader = new ZXing.BrowserQRCodeReader();

let botonPC;
let botonADD;
let botonDEL;

let botonesPC = {};
let botonC = {};

let lastData = "Error"

function setup() {

  //socket = io.connect('https://192.168.0.5:3000');
  socket = io.connect('https://10.10.3.169:3000');

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
  select('video').size(bot.ancho, max(select('video').height, bot.ancho));

  //preparar(botonT, 20, 5, "Siguiente", "Tipo dispositivo");
  //botonT.buttonT.mousePressed(typeSet);

  botonPC = createButton("AGREGAR PC");
  botonPC.position(60, 40);
  botonPC.mousePressed(modoPC);
  botonPC.hide();

  botonADD = createButton("AGREGAR COMENTARIO");
  botonADD.position(60, 70);
  botonADD.mousePressed(modoADD);
  botonADD.hide();

  botonDEL = createButton("ELIMINAR PC");
  botonDEL.position(60, 100);
  botonDEL.mousePressed(modoDEL);
  botonDEL.hide();

  preparar(botonC, 20, 5, "Siguiente", "Cambio");
  botonC.buttonT.mousePressed(typeCOM);

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
    break;
    case 3:
    completarCOM();
    break;
    default:
  }
}

//EXPORTAR EXCEL

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
  query.name = result.text;
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
  fill(255);
  textSize(18);
  text("SELECCIONE MODO", 60, 30);
  botonPC.show();
  botonADD.show();
  botonDEL.show();
  select('video').hide();
  if(query.type != undefined){
    if(query.type == "PC"){
      cambiarModo(2);
    }else if(query.type == "DEL"){
      socket.emit('qrD', query.name);
      query = {};
      cambiarModo(0);
    }else if(query.type == "ADD"){
      cambiarModo(3);
    }else{
      cambiarModo(0);
    }
    botonPC.hide();
    botonADD.hide();
    botonDEL.hide();
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

function completarCOM(){
  background(51);
  botonC.typeT.show();
  botonC.buttonT.show();
  botonC.greetingT.show();
  select('video').hide();
  if(query.com != undefined){
    cambiarModo(0);
    socket.emit('qrA', query);
    query = {};
    lastData = "Error";
    botonC.typeT.hide();
    botonC.buttonT.hide();
    botonC.greetingT.hide();
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
  query.nombre = botonesPC.typeNombre.value();
  query.lugar = botonesPC.typeLugar.value();
  query.numero = botonesPC.typeLugar.value();

  query.ip = botonesPC.typeIP.value();
  query.ssd = botonesPC.typeSSD.value();
  query.ramt = botonesPC.typeRAMT.value();
  query.ramm = botonesPC.typeRAMM.value();
  query.cpu = botonesPC.typeCPU.value();
  query.mother = botonesPC.typeMother.value();
  query.video = botonesPC.typeVideo.value();
  query.fuente = botonesPC.typeFuente.value();
  query.mouse = botonesPC.typeMouse.value();
  query.teclado = botonesPC.typeTeclado.value();
  query.monitor = botonesPC.typeMonitor.value();
  query.categoria = botonesPc.typeCategoria.value();
  query.garantiav = botonesPC.typeGarantiaV.value();
  query.garantiau = botonesPC.typeGarantiaU.value();
  query.proveedor = botonesPC.typeProveedor.value();
  query.fechaI = botonesPC.typeFechaI.value();

  b.saidNombre = createElement('h2', "Nombre: ");
  b.saidNombre.position(x, y);
  b.saidNombre.style('color:#FFFFFF');

  b.typeNombre = createInput();
  b.typeNombre.position(x+120, y+20);

  b.saidLugar = createElement('h2', "Lugar: ");
  b.saidLugar.position(x, y+30);
  b.saidLugar.style('color:#FFFFFF');

  b.typeLugar = createInput();
  b.typeLugar.position(x+120, y+50);

  b.saidNumero = createElement('h2', "Numero: ");
  b.saidNumero.position(x, y+60);
  b.saidNumero.style('color:#FFFFFF');

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
  query.nombre = botonesPC.typeNombre.value();
  query.lugar = botonesPC.typeLugar.value();
  query.numero = botonesPC.typeLugar.value();
  query.ip = botonesPC.typeIP.value();
  query.ssd = botonesPC.typeSSD.value();
  query.ramt = botonesPC.typeRAMT.value();
  query.ramm = botonesPC.typeRAMM.value();
  query.cpu = botonesPC.typeCPU.value();
  query.mother = botonesPC.typeMother.value();
  query.video = botonesPC.typeVideo.value();
  query.fuente = botonesPC.typeFuente.value();
  query.mouse = botonesPC.typeMouse.value();
  query.teclado = botonesPC.typeTeclado.value();
  query.monitor = botonesPC.typeMonitor.value();
  query.categoria = botonesPc.typeCategoria.value();
  query.garantiav = botonesPC.typeGarantiaV.value();
  query.garantiau = botonesPC.typeGarantiaU.value();
  query.proveedor = botonesPC.typeProveedor.value();
  query.fechaI = botonesPC.typeFechaI.value();
}

function typeCOM(){
  query.com = botonC.typeT.value();
}

function verData(data){
  textSize(18);
  fill(255);
  if(data == "Not"){
    text(query.name     , ancho/2 + dif, 5*dif+bot.alto);
    text("No encontrado", ancho/2 + dif, 8*dif+bot.alto);
  }else if(data == "YES"){
    text("Ya se encuentra", ancho/2 + dif, 5*dif+bot.alto);
  }else if(data.type == "PC"){
    text(data.name     , ancho/2+ dif,  5*dif+bot.alto);
    text(data.type     , ancho/2+ dif,  8*dif+bot.alto);
    text(data.nombre   , ancho/2+ dif, 11*dif+bot.alto);
    text(data.lugar    , ancho/2+ dif, 14*dif+bot.alto);
    text(data.numero   , ancho/2+ dif, 17*dif+bot.alto);
    text(data.proveedor, ancho/2+ dif, 20*dif+bot.alto);
    text(data.fechac   , ancho/2+ dif, 23*dif+bot.alto);
    text(data.fechaI   , ancho/4+ dif, 23*dif+bot.alto);

    text(data.ip       , ancho/2+ dif, 26*dif+bot.alto);
    text(data.cpu      , ancho/2+ dif, 29*dif+bot.alto);
    text(data.ssd      , ancho/2+ dif, 32*dif+bot.alto);
    text(data.ramt     , ancho/2+ dif, 35*dif+bot.alto);
    text(data.ramm     , ancho/2+ dif, 38*dif+bot.alto);
    text(data.mother   , ancho/2+ dif, 41*dif+bot.alto);
    text(data.video    , ancho/2+ dif, 44*dif+bot.alto);
    text(data.fuente   , ancho/2+ dif, 47*dif+bot.alto);

    text(data.mouse    , ancho/2+ dif, 50*dif+bot.alto);
    text(data.teclado  , ancho/2+ dif, 53*dif+bot.alto);
    text(data.monitor  , ancho/2+ dif, 56*dif+bot.alto);
    text(data.categoria, ancho/2+ dif, 59*dif+bot.alto);
    text(data.garantiav, ancho/2+ dif, 62*dif+bot.alto);
    text(data.garantiau, ancho/2+ dif, 65*dif+bot.alto);
    text(data.windows  , ancho/2+ dif, 68*dif+bot.alto);

  }else{
    text(data.name, ancho/2+ dif, 5*dif+bot.alto);
    text(data.type, ancho/2+ dif, 6*dif+bot.alto);
  }
}

function modoPC(){
  query.type = "PC"
}

function modoADD(){
  query.type = "ADD"
}

function modoDEL(){
  query.type = "DEL"
}
