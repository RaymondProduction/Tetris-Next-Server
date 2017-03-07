// серверный модуль менеджмента сессий
var ids = []; // массив  идентификаторов id
var name = {}; // массив  имен [id]
var timeTable = {}; // массив времени
var numClient = 0; // количество клиентов
var classCl = {};

leaveCall = function(){};

var io; // для обращения к socket

// подключение к socket, передаем через аргумент
module.exports.socket = function(i) {
  io = i
};

// запуск всех обработчиков и слушателей
// для авторизации, полный менеджмент
// отслеживание подключения и отключения
// клиентов и их активность
module.exports.startServices = function() {
  // если подключился клиент
  io.on('connection', function(socket) {
    // присоединился не авторизованный клиент
    socket.on('connected', function(msg) {
      data = JSON.parse(msg);
      // присвоим ему id
      ids[numClient] = data.id;
      // учтем количество клиентов
      numClient++;
      // ассоциативный массив, имя пользователя оп ключу
      name[data.id] = '';
      // таблица времени, установим 6 тиков
      timeTable[data.id] = 6;
      // присвоить класс (тип)
      classCl[data.id] = data.cl;
    });

    // если от клиента пришел запрос joined
    // значит он авторизовался
    socket.on('joined', function(msg) {
      // преобразуем JSON в данные
      var data = JSON.parse(msg);
      // запишем имя клиента, в память сервера
      name[data.id] = data.name;
      // клиент сообщить остальным что
      // клиент подключился
      io.emit('someone joined', msg);
    });

    // запрос на получение списка клиентов
    socket.on('get list', function(i) {
      // подготовим массив
      var list = [];
      // пробежим по всем id
      ids.forEach(function(id) {
        // если имя есть, учтем в список
        if (name[id] != '' && classCl[id] == classCl[i]) {
          // создадим и положим объект
          // идентификатор + имя
          list.push({
            id: id,
            name: name[id],
          });
        }
      });
      // отправим информацию
      io.emit('list clients', JSON.stringify(list));
    });

    // если клиент (пользователь) отвечает что он
    // в сети продлим время пребывание на 6 тиков
    socket.on('i am online', function(id) {
      if (timeTable[id] != undefined) {
        timeTable[id] = 6;
      }
    });


    // от клиента пришло сообщение что он
    // покинул чат
    socket.on('the client leaves', function(id) {
      // отправим запрос всем чтоб все удалили из списка его
      io.emit('the client delete from list', JSON.stringify({
        id: id,
        cl: classCl[id],
      }));
      // то удалим его из списка времени
      delete timeTable[id];
      // удалим со списка клиентов
      delete name[id];
      ids.splice(ids.indexOf(id), 1);
    });


    socket.on('more information',function(){
      io.emit('more information');
    });


    socket.on('joined more information',function(data){
      io.emit('joined more information',data);
    });

    socket.on('more information about this',function(obj){
      io.emit('more information about this',obj);
    });


  });

  // делаем тики (интервалы) для проверки онлайн ли клиент
  setInterval(function() {
    // пробегаем по всему списку клиентов
    ids.forEach(function(id) {
      // уменьшаем время пребывания на 1
      if (name[id] != '') {
        timeTable[id]--;
      }
      if (timeTable[id] < 1) {

        // если время вышло, то удалим его
        delete timeTable[id];
        delete name[id];
        // отправим запрос всем чтоб все удалили из списка его
        io.emit('the client leaves because time', JSON.stringify({
          id: id,
          cl: classCl[id],
        }));
        // серверу тоже скажем чтоб удалил
        if (leaveCall != undefined) {
          leaveCall(id, classCl[id]);
        }
        // удалим со списка клиентов
        ids.splice(ids.indexOf(id), 1);
      } else {
        // если время еще не вышло спросить может он онлайн все же
        io.emit('are you online', id);
      }
    });
  }, 2000);

}

module.exports.leaves = function(call){
  leavesCall = call;
}

module.exports.nameById = function(id) {
  return name[id];
}

module.exports.arrivedData = function(cl, call) {
  io.on('connection', function(socket) {
    socket.on('send', function(massage) {
      var data = JSON.parse(massage);
      if (cl == data.cl) {
        call(data.id, data.obj);
      };
    });
  });
}

module.exports.sendData = function(cl, id, obj) {
  data = {
    id: id,
    cl: cl,
    obj: obj,
  }
  io.emit('data', JSON.stringify(data));
}

module.exports.getListIdByClass = function(cl){
      var list = [];
      // пробежим по всем id
      ids.forEach(function(id) {
        // если имя есть, учтем в список
        if (name[id] != '' && classCl[id] == cl) {
          // создадим и положим объект
          // идентификатор + имя
          list.push({
            id: id,
            name: name[id],
          });
        }
      });
      return list;
}
