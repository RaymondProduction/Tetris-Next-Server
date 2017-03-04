// серверный модуль менеджмента сессий
var ids = [];  // массив  идентификаторов id
var name = {}; // массив  имен [id]
var timeTable = {}; // массив времени
var numClient=0; // количество клиентов

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
    socket.on('connected', function(id) {
      // присвоим ему id
      ids[numClient]=id;
      // учтем количество клиентов
      numClient++;
      // ассоциативный массив, имя пользователя оп ключу
      name[id]='';
      // таблица времени, установим 6 тиков
      timeTable[id]=6;
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
    socket.on('get list',function(){
      // подготовим массив
      var list = [];
      // пробежим по всем id
      ids.forEach(function(id){
        // если имя есть, учтем в список
        if (name[id]!='') {
          // создадим и положим объект
          // идентификатор + имя
          list.push({
            id : id,
            name : name[id],
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
      io.emit('the client delete from list', id);
      // то удалим его из списка времени
      delete timeTable[id];
      // удалим со списка клиентов
      delete name[id];
      ids.splice(ids.indexOf(id), 1);
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
        io.emit('the client leaves because time', id);
        // удалим со списка клиентов
        ids.splice(ids.indexOf(id), 1);
      } else {
        // если время еще не вышло спросить может он онлайн все же
        io.emit('are you online', id);
      }
    });
  }, 2000);

}

module.exports.arrivedData = function(cl, call) {
  io.on('connection', function(socket) {
    socket.on('send for ' + cl, function(massage) {
      var data = JSON.parse(massage);
      call(data.id, data.obj);
    });
  });
}

module.exports.sendData = function(cl, id, obj) {
  data = {
    id : id,
    cl: cl,
    obj: obj,
  }
  io.emit('data', JSON.stringify(data));
}
