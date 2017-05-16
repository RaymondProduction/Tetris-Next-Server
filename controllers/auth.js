exports.forAccessToken = function(ctx, next) {
  // загружаем client_id, client_secret из файла config.json
  const client = require('./load_config');
  console.log(client.client_id);
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
      // var fs = require('fs');
      var res = JSON.parse(body);
      console.log('token_type', res.token_type);
      console.log('access_token', res.access_token);
      //  access_token, refresh_token, token_type, expires

      // fs.writeFile('/response.txt', JSON.stringify(response), (err) => {
      //   if (err) throw err;
      //   console.log('The file respnse.txt has been saved!');
      // });

      // fs.writeFile('/body.txt', JSON.stringify(body), (err) => {
      //   if (err) throw err;
      //   console.log('The file body.txt has been saved!');
      // });

    });


  //ctx.redirect('https://google.com.ua');
}

exports.mainPage = function(ctx) {
  var fs = require('fs');
  ctx.type = 'html'
  ctx.body = fs.createReadStream('views/oauth.html');
}

exports.accessToken = function(ctx, next) {
  console.log('request!!!! =>', ctx.request.body);
}
