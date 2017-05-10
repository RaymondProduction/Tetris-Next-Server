var koa = require('koa');
var http = require('http');
var https = require('https');
var fs = require('fs');
var forceSSL = require('koa-force-ssl');

var app = koa();

// Force SSL on all page
app.use(forceSSL());

// index page
app.use(function * (next) {
  this.body = "hello world from " + this.request.url;
});

// SSL options
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('csr.pem')
}

// start the server
http.createServer(app.callback()).listen(80);
https.createServer(options, app.callback()).listen(443);
