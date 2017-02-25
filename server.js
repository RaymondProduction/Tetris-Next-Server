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


// объект с данными
var data = {
  name: '',
  massage: '',
  list: [],
  status: ''
}

// список клиентов который хранится на сервере
var userList = [];

// список времени до отключения и удаления
var userListTime = {};

// карта расположения кубов
var map = new Array();
for (var i = 0; i < 100; i++) {
  map[i] = new Array();
  for (var j = 0; j < 100; j++) {
    map[i][j] = '';
  }
}


// Вывод в консоль уведомления о запуске сервера и ip веб сервера
console.log('Start Web Server'.green.bold, ' Local ip address is '.cyan, ip.address().cyan);

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

// вывод входящих сообщений на консоль
io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    console.log('Socket=>'.blue, ' message: ' + msg);
  });

  socket.on('joined the chat', function(msg) {
    console.log('Socket=>'.blue, ' joined the chat');
  });
});

// отправка методом emit входящих сообщений назад
io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    data = JSON.parse(msg);
    msg = JSON.stringify(data);
    io.emit('chat message', msg);
  });

  // если подключился пока неизвестный пользователь
  socket.on('connected', function(msg) {
    // скопируем список всех пользователей на сервере
    data.list = userList.slice();
    // подготовим строку JSON
    msg = JSON.stringify(data);
    // отправим ее клиенту
    io.emit('someone connected', msg);
  });

  // зарегестрированый пользователь
  socket.on('joined the chat', function(msg) {
    // покдлючаем данные в которых самая полезная информация
    // это имя нового пользователя
    data = JSON.parse(msg);
    // добавим с массив это имя
    userList.push(data.name);
    // добавим в список времени, даем 6 тиков
    userListTime[data.name] = 6;
    // скопируем в данные весь список
    data.list = userList.slice();
    // конвертируем в строку JSON
    msg = JSON.stringify(data);
    // отправим клиенту
    io.emit('joined the chat', msg);
  });



  // от клиента пришло сообщение что он
  // покинул чат
  socket.on('the user leaves', function(name) {
    // то удалим его из списка времени
    delete userListTime[name];
    // удалим со списка клиентов
    userList.splice(userList.indexOf(name), 1);
    // отправим запрос всем чтоб все удалили из списка его
    io.emit('the user leaves', name);
  });



  // если клиент (пользователь) отвечает что он
  // в сети продлим время пребывание на 6 тиков
  socket.on('i am online', function(n) {
    userListTime[n] = 6;
  });

  // событие, создание куба
  socket.on('create cube', function(dataOfcube) {
    cube = JSON.parse(dataOfcube);
    // поставим куб на карте
    map[cube.x][cube.y] = cube.color;
  });

  // событие от клиента, двигаем куб
  socket.on('move cube', function(dataOfcube) {
    cube = JSON.parse(dataOfcube);
    // получим текущие координты куба
    var xx = cube.x;
    var yy = cube.y;
    // запомним кооординаты как те которы были ранее earlier
    cube.ex = xx;
    cube.ey = yy;

    // обороботка нажатой клавиши клиентом
    var keyCode = cube.k;

    // изменяем координаты соответсвенно
    if (keyCode == 37) {
      xx -= 1;
    }
    if (keyCode == 38) {
      yy -= 1;
    }
    if (keyCode == 39) {
      xx += 1;
    }
    if (keyCode == 40) {
      yy += 1;
    }

    // если занято то стоим
    if (map[xx][yy] != '') {
      // пометим свойсво предыдущих координат как неопределенные
      // клиенская программа не будет перерисовывать куб в этом
      // случае
      cube.ex = undefined;
      cube.ey = undefined;
    } else {
      // иначе двигаем
      // убираем с предыдущего положения
      map[cube.ex][cube.ey] = '';
      // ставим на новое на карте
      map[xx][yy] = cube.color;
      // сохраняем новые коодинаты
      cube.x = xx;
      cube.y = yy;
    }
    // отправляем клиенту новое положение
    io.emit('server move', JSON.stringify(cube));

  });

});

// делаем тики (интервалы) для проверки онлайн ли клиент
setInterval(function() {
  // пробегаем по всему списку клиентов
  userList.forEach(function(name) {
    // уменьшаем время пребибывания на 1
    userListTime[name] = userListTime[name] - 1;
    if (userListTime[name] < 1) {
      // если время вышло, то удалим его
      delete userListTime[name];
      // удалим со списка клиентов
      userList.splice(userList.indexOf(name), 1);
      // отправим запрос всем чтоб все удалили из списка его
      io.emit('the user leaves', name);
    } else {
      // если время еще не вышло спросить может он онлайн все же
      io.emit('are you online', name);
    }
  });
}, 2000)



function parametr(par) {
  var res;
  process.argv.forEach(function(item, i, arr) {
    if (par == item) {
      res = process.argv[i + 1];
    }
  });
  return res;
}
