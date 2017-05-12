exports.forAccessToken = function(ctx, next) {
  ctx.redirect('https://google.com.ua');
}
POST /oauth/token HTTP/1.1
Host: oauth2server.com

code=Yzk5ZDczMzRlNDEwY
&grant_type=code
&client_id=mRkZGFjM
&client_secret=ZGVmMjMz



  console.log(ctx.query.code);
  var request = require('request');
  request.post({
      url: 'https://github.com/login/oauth/access_token',
      form: {
        title: 'GET TOKEN',
        client_id: 1,
        client_secret: 1,
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
