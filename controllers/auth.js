exports.forAccessToken = function(ctx, next) {
  // загружаем client_id, client_secret из файла config.json
  const client = require('./load_config');
  console.log(client.client_id);
  console.log('code ',ctx.query.code);
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
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.

      console.log('access_token', response.access_token);
      console.log('refresh_token', response.refresh_token);
      console.log('token_type', response.token_type);
      console.log('expires', response.exports);

      console.log('access_token', body.access_token);
      console.log('refresh_token', body.refresh_token);
      console.log('token_type', body.token_type);
      console.log('expires', body.exports);
      //  access_token, refresh_token, token_type, expires
    });


  //ctx.redirect('https://google.com.ua');
}

exports.mainPage = function(ctx){
  var fs = require('fs');
  ctx.type = 'html'
  ctx.body = fs.createReadStream('views/oauth.html');
}

exports.accessToken = function(ctx, next){
  console.log('request!!!! =>',ctx.request.body);
}
