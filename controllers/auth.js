exports.forAccessToken = function(ctx, next) {
  // загружаем client_id, client_secret из файла config.json
  const client = require('./load_config');
  console.log('code ', ctx.query.code);
  var request = require('request');
  request.post({
      url: 'https://github.com/login/oauth/access_token',
      form: {
        client_id: client.client_id,
        client_secret: client.client_secret,
        code: ctx.query.code,
        redirect_uri: 'https://tetris-next.net/oauth',
        state: ctx.query.state,
      },
      headers: {
        accept: 'application/json'
      }
    },
    function(error, response, body) {
      var res = JSON.parse(body);
      console.log('access_token', res.access_token);
      request.get({
          url: 'https://api.github.com/user',
          headers: {
            'authorization' : 'token '+ res.access_token,
            'accept': 'application/json',
            'user-agent': 'node.js'
          }
        },
        function(error, response, body) {
          //var res = JSON.parse(body);
          console.log('answer: ',body);
        });

    });
}

exports.mainPage = function(ctx) {
  var fs = require('fs');
  ctx.type = 'html'
  ctx.body = fs.createReadStream('views/oauth.html');
}

exports.accessToken = function(ctx, next) {
  console.log('request!!!! =>', ctx.request.body);
}
