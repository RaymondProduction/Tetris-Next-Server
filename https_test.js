var koa = require('koa');
var http = require('http');
var https = require('https');
var fs = require('fs');
var forceSSL = require('koa-force-ssl');

var app = koa();

// Force SSL on all page
app.use(forceSSL());

// index page
app.use(function*(next) {
  this.body = "hello world from " + this.request.url;
});

// SSL options
var options = {
  // Сертификат и ключ генерировались с помощью команд
  // Certificate and key generating with commands
  // openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
  // openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
  key: fs.readFileSync('./key.pem', 'utf8'),
  cert: fs.readFileSync('./server.crt', 'utf8')
};

// start the server
http.createServer(app.callback()).listen(3000); //80
https.createServer(options, app.callback()).listen(3001); //443
// var httpserver = http.createServer(app).listen('3004', '127.0.0.1');
// var https_server = https.createServer(options, app).listen('3005', '127.0.0.1');
