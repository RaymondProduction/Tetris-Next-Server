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
        redirect_uri: 'http://127.0.0.1:4000/',
        state: ctx.query.state,
      }
    },
    function(error, response, body) {
      console.log('response', response);
      console.log('body', body);
      //  access_token, refresh_token, token_type, expires

      fs.writeFile('response.txt', response, (err) => {
        if (err) throw err;
        console.log('The file respnse.txt has been saved!');
      });

      fs.writeFile('body.txt', response, (err) => {
        if (err) throw err;
        console.log('The file body.txt has been saved!');
      });

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
