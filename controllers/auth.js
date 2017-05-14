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
    });


  //ctx.redirect('https://google.com.ua');
}
