
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

let botonesPC = {said:[], typePc:[]};
let botonC = {};

//let listaPC = [nombre, lugar, numero, ip, ssd, ramt, ramm, cpu, mother, video, fuente
//               , mouse, teclado, monitor, categoria, garantiav, garantiau, proveedor, fechaC, fechaI];

let nombrePC = ["Nombre", "Lugar", "Numero", "IP", "SSD", "Cant RAM", "MOD RAM", "CPU", "MOTHER", "GPU", "Fuente"
              , "Mouse", "Teclado", "Monitor", "Categoria", "Garantia Fecha", "Garantia Lugar", "Proveedor", "Fecha C", "Fecha I"];

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
  alto = 625;

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
  for (var i = 0; i < botonesPC.typePc.length; i++) {
    botonesPC.said[i].show();
    botonesPC.typePc[i].show();
    botonesPC.buttonPC.show();
  }
  select('video').hide();
  if(query.ip != undefined){
    cambiarModo(0);
    socket.emit('qrW', query);
    query = {};
    lastData = "Error";
    for (var i = 0; i < botonesPC.typePc.length; i++) {
      botonesPC.said[i].hide();
      botonesPC.typePc[i].hide();
      botonesPC.buttonPC.hide();
    }
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

  for (var i = 0; i < nombrePC.length; i++) {
    b.said[i] = createElement('h2', nombrePC[i]);
    b.said[i].position(x, y+i*30);
    b.said[i].style('color:#FFFFFF');
    b.said[i].hide();

    b.typePc[i] = createInput();
    b.typePc[i].position(x+180, y+20+i*30);
    b.typePc[i].hide();
  }

  b.buttonPC = createButton(bot);
  b.buttonPC.position(x+360, y-10+nombrePC.length*30);
  b.buttonPC.hide();
}

function typePc(){
  query.nombre = botonesPC.typePc[0].value();
  query.lugar = botonesPC.typePc[1].value();
  query.numero = botonesPC.typePc[2].value();
  query.ip = botonesPC.typePc[3].value();
  query.ssd = botonesPC.typePc[4].value();
  query.ramt = botonesPC.typePc[5].value();
  query.ramm = botonesPC.typePc[6].value();
  query.cpu = botonesPC.typePc[7].value();
  query.mother = botonesPC.typePc[8].value();
  query.video = botonesPC.typePc[9].value();
  query.fuente = botonesPC.typePc[10].value();
  query.mouse = botonesPC.typePc[11].value();
  query.teclado = botonesPC.typePc[12].value();
  query.monitor = botonesPC.typePc[13].value();
  query.categoria = botonesPC.typePc[14].value();
  query.garantiav = botonesPC.typePc[15].value();
  query.garantiau = botonesPC.typePc[16].value();
  query.proveedor = botonesPC.typePc[17].value();
  query.fechaC = botonesPC.typePc[18].value();
  query.fechaI = botonesPC.typePc[19].value();
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
  }else{
    text(data.garantiau, ancho/2+ dif, 65*dif+bot.alto);

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
