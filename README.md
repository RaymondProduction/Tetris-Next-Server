# Tetris-Next-Server

## What is this?

It is web server for Tetris-Next

## How use?
```
$ npm install
```

### before
```
$ node server.js --port <port> --directory <directory with Tetris-Next>
```

####This server supports chat

# Инструкция к серверной и клинской части модуля session

## Клиентская часть
конструктор создает сессию и присваивает идентификатор сессии
** session = new sessionModule(); **

** getList(call([{id, name},{id,name},...])) ** - передает функции обратного вызова список подключенных клиентов

```
session.getList(function(list) {
        self.data.list = list;
        // покажем список всех клиентов
        list.forEach(function(user) {
          console.log(user.id,user.name);
        });
      });
```

** session.authorize(name) **- передаем имя клиента для авторизации в даной сессии

** session.someoneJoined(call({id, name})) ** - передаем информацию кто подключился функции обратного вызова
```
 session.someoneJoined(function(data) {
        console.log(data);
      });
```
** session.someoneLeaveBecauseTime() ** - оповещение что клиент отключился по истечении времени на сервере из-за отсутствия соединения
```
session.someoneLeaveBecauseTime(function(id) {
        console.log('Leave because time =>', id);
      })
```
** session.sendData(класс, сообщение) ** - отправить данные (сообщение) на сервер.Первый аргумент используется для идентификации типа сообщения.

** session.arrivedData(название класса, функц) ** - получить данные с сервера, вызывает функцию обратного вызова с передачей сообщения от сервера, сообщение выступает как объект. Первый аргумент используется для идентификации типа сообщения.
     session.arrivedData('chat', function(id,data) {
          console.log(data);
      });

*** session.iLeave() *** - уйти с сессии (наверно работает не корректно проверить =) )

## Серверная часть

Подключаем модуль
var session = require('./session');

session.socket(<<socket>>) - Передаем объект socket для взаимодействия с сервером.
**Пример**

```
var app = require('koa')();
var server = app.listen(8080);
var io = require('socket.io').listen(server);
session.socket(io);
```

** session.startServices() ** - запуск, всех сервисов для отслеживания клиентской активности, опросы кото подключен, кто отключился и присоединился и дополнительный анализ времени пребывания онлайн.

 session.sendData('chat',id,message) - отправка сообщения, первый аргумент это тип сообщения, вторые два ид отправителя, и сообщение

** session.arrivedData(,function(id,message)) - получение данных от клиента. Первый параметр определяет тип полученного сообщения. Вызов функции обратного вызова для передачи ид клиента и сообщения
```
session.arrivedData('chat',function(id,message){
  session.sendData('chat',id,message);
});
```
