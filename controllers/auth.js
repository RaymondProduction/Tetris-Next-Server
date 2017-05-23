var callForToken;
var callForName;
var accessToken;

exports.forAccessToken = function(ctx, next) {
  // делаем промис, так как koa именно так обрабатывает
  var promise = new Promise(function(resolve, reject) {
    // загружаем client_id, client_secret из файла config.json
    const client = require('./load_config');
    // убедися что получаем код
    console.log('code ', ctx.query.code);
    // делаем запрос на получение токена
    var request = require('request');
    request.post({
        url: 'https://github.com/login/oauth/access_token', // point для получения токена
        form: {
          client_id: client.client_id, // передаем client.id
          client_secret: client.client_secret, // передаем client.secret
          code: ctx.query.code, // передаем code
          redirect_uri: 'https://tetris-next.net/oauth', // редирект на получение токена
          state: ctx.query.state,
        },
        headers: {
          accept: 'application/json' // формат полученных даных будет JSON
        }
      },
      function(error, response, body) { // ответ с токеном
        var res = JSON.parse(body);
        // передаем токен в функцию обратного вызова для
        // метода getToken
        callForToken(res.access_token);
        accessToken = res.access_token;
        // запрос на дополнительную информацию, о пользователе с использованием токена
        request.get({
            url: 'https://api.github.com/user',
            headers: {
              'authorization': 'token ' + res.access_token,
              'accept': 'application/json',
              'user-agent': 'node.js'
            }
          },
          function(error, response, body) {
            var res = JSON.parse(body);
            console.log('login: ', res.login);
            console.log('name: ', res.name);
            console.log('id:', res.id);
            if (res.login) { // если логин есть, значит все чудненько
              // отправим куки со значением токена
              ctx.cookies.set('token', accessToken);
              // делаем редирект на главную страничьку
              ctx.redirect('/game?t=' + accessToken);
              // передаем имя пользователя в функцию обратного вызова для
              // метода getName
              callForName(res.name);
              resolve(ctx);
            } else {
              ctx.redirect('/'); // иначе плохо
              reject(ctx);
            };
          });
      });

  });

  return promise;
}

exports.getToken = function(call) {
  callForToken = call;
}

exports.getName = function(call) {
  callForName = call;
}

exports.mainPage = function(ctx) {
  var fs = require('fs');
  ctx.type = 'html'
  ctx.body = fs.createReadStream('views/oauth.html');
}

exports.test = function(ctx, next) {
  var promise = new Promise(function(resolve, reject) {
    console.log('request!!!! =>', ctx.request.body);
    ctx.type = 'html'
    ctx.body = ctx.cookies.get('token');
        // делаем запрос на получение токена
    var request = require('request');
    request.get({
        url: 'https://api.github.com/user',
        headers: {
          'authorization': 'token ' + ctx.cookies.get('token'),
          'accept': 'application/json',
          'user-agent': 'node.js'
        }
      },
      function(error, response, body) {
        var res = JSON.parse(body);
        console.log('login: ', res.login);
        console.log('name: ', res.name);
        console.log('id:', res.id);
        if (res.login) { // если логин есть, значит все чудненько
          // отправим куки со значением токена
          ctx.type = 'html'
          ctx.body = res;
          resolve(ctx);
        } else {
          reject(ctx);
        };
      });
  });
  return promise;
}
