// модуль для цвета
var colors = require('colors');
// модуль для роботы с ip адресами
var ip = require('ip');
// web framework for node.js
var app = require('koa')();
// определим номер порта, чере ключ в командной строке
var port = parametr('--port');

//  если порта нет то используем по умолчянию 8080
if (port) {
  server = app.listen(Number(port));
} else {
  server = app.listen(8080);
}

// это важно! подключаем сокет к серверу
// сокет - розетка, модуль для мгновенной
// передачи данных
var io = require('socket.io').listen(server);

// модуль для роботы с файловой системной
// так как сервер будет использовать файлы
var fs = require('fs');
// используем модуль path для роботы
// с путями к файлам
var path = require('path');

var buf; // буфер байт из файла
var str; // строка из файла
var rootDir = parametr('--directory'); // определим корневую папку
// контекстный массив для определения основных
// типов файлов
var staticContent = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/plain',
  '.jpg': 'image/jpg',
  '.png': 'image/png'
};



// Вывод в консоль уведомления о запуске сервера и ip веб сервера
console.log('Start Web Server'.green.bold, ' Local ip address is '.cyan, ip.address().cyan);

// Ругается eslint 47:17  error  Parsing error: Unexpected token *
app.use(function*(next) {
  yield next;
  var url = this.url;
  console.log('GET => '.magenta, url, '\tContent type: '.yellow, staticContent[path.extname(url)]);
  if (url == '/') {
    url = '/index.html';
  }
  this.type = staticContent[path.extname(url)];
  if (fs.existsSync(rootDir + url)) {
    buf = fs.readFileSync(rootDir + url);
    // str = buf.toString();
    str = buf;
  } else {
    console.log('Not found'.red);
    str = 'Not found :(';
  }

  this.body = str;
});



// мой модуль
var session = require('./session');

session.socket(io);
session.startServices();


session.arrivedData('chat', function(id, message) {
  session.sendData('chat', id, message);
});



// карта расположения кубов
var map = new Array();
for (var i = 0; i < 100; i++) {
  map[i] = new Array();
  for (var j = 0; j < 100; j++) {
    map[i][j] = '';
  }
}

// ассоциативные массивы, положение куба по id
xCube = {};
yCube = {};

// пока не работает
session.leaves(function(){
  console.log('leave');
});

session.arrivedData('cube', function(id, dataOfcube) {
  // запрос на список
  if (dataOfcube.why == 'list') {
    // узнаем список id, для класса 'cube'
    var list = session.getListIdByClass('cube');
    // заполним список координатами и цветами кубов
    var listForSend = [];
    list.forEach(function(c) {
      listForSend.push({
        x: xCube[c.id],
        y: yCube[c.id],
        color: map[xCube[c.id]][yCube[c.id]],
      });
    });
    session.sendData('cube', id, {
      list : listForSend,
      why: 'list',
    });

  }
  // запрос "поставить" куб всем пользователям
  if (dataOfcube.why == 'put') {
    map[dataOfcube.x][dataOfcube.y] = dataOfcube.color;
    xCube[id] = dataOfcube.x;
    yCube[id] = dataOfcube.y;
    session.sendData('cube', id, {
      x: dataOfcube.x,
      y: dataOfcube.y,
      why: 'put',
      color: dataOfcube.color,
    });
  }
  // запрос "переместить куб"
  if (dataOfcube.why == 'move') {
    var x = dataOfcube.x;
    var y = dataOfcube.y;
    if (dataOfcube.k == 37 && map[x - 1][y] == '' && x > 1) {
      x--
    };
    if (dataOfcube.k == 38 && map[x][y - 1] == '' && y > 1) {
      y--
    };
    if (dataOfcube.k == 39 && map[x + 1][y] == '' && x < 99) {
      x++
    };
    if (dataOfcube.k == 40 && map[x][y + 1] == '' && y < 99) {
      y++
    };

    map[dataOfcube.x][dataOfcube.y] = '';
    map[x][y] = dataOfcube.color;
    xCube[id]=x;
    yCube[id]=y;

    session.sendData('cube', id, {
      x: x,
      y: y,
      ex: dataOfcube.x,
      ey: dataOfcube.y,
      why: 'move',
      color: session.nameById(id),
    });

  }
});



io.on('join', function*() {
  console.log('join event fired', this.data)
})

// оброботка события подключения, или отключения от сокета
io.on('connection', function(socket) {
  console.log('Socket=>'.blue, ' a user connected');



  socket.on('disconnect', function() {
    console.log('Socket=>'.blue, ' user disconnected');
  });

});



function parametr(par) {
  var res;
  process.argv.forEach(function(item, i, arr) {
    if (par == item) {
      res = process.argv[i + 1];
    }
  });
  return res;
}
