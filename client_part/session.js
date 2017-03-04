define('session', ['socketio'],
  function(io) {

    // Module for organization session client <--> server
    function sessionObj() {
      this.listIsNotReceived = true;
      this.id = Math.floor(Math.random() * 7000000000);
      this.socket = io();
      this.socket.emit('connected', this.id);
      var self = this;
      // если пришел запрос на проверку онлайн ли клиент
      this.socket.on('are you online', function(id) {
        // узнаем речь ли идет про этого клиента
        if (self.id == id) {
          // ответить серверу что да, онлайн!
          self.socket.emit('i am online', id);

        }
      });
    };

    sessionObj.prototype.authorize = function(name) {
      var self = this;
      this.name = name;
      this.socket.emit('joined', JSON.stringify({
        id: this.id,
        name: this.name,
      }));
    };

    sessionObj.prototype.getList = function(call) {
      this.listIsNotReceived = true;
      var self = this;
      this.socket.emit('get list',this.id);
      this.socket.on('list clients', function(list) {
        if (self.listIsNotReceived) {
          call(JSON.parse(list));
          self.listIsNotReceived = false;
        }
      });
    }


    sessionObj.prototype.someoneJoined = function(call) {
      var self = this;
      this.socket.on('someone joined', function(msg) {
        var data = JSON.parse(msg);
        if (data.id != self.id) {
          call(data);
        };
      });
    }

    sessionObj.prototype.iLeave = function() {
      this.socket.emit('the client leaves', this.id);
    }

    sessionObj.prototype.someoneLeave = function(call) {
      var self = this;
      this.socket.on('the client delete from list', function(id) {
        call(id);
      });
    }

    sessionObj.prototype.someoneLeaveBecauseTime = function(call) {
      var self = this;
      this.socket.on('the client leaves because time', function(id) {
        call(id);
      });
    }

    sessionObj.prototype.arrivedData = function(cl, call) {
      var self = this;
      this.socket.on('data', function(msg) {
        data = JSON.parse(msg);
        if (data.cl == cl /*&& data.id != self.id*/) {
          call(data.id,data.obj);
        };
      });
    }

    sessionObj.prototype.sendData = function(cl, obj) {
      data = {
        cl: cl,
        id: this.id,
        obj: obj,
      }
      this.socket.emit('send for ' + cl, JSON.stringify(data));
    }
    return sessionObj;
  });
