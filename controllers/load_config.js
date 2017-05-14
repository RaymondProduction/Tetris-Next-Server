var fs = require('fs');
object = JSON.parse(fs.readFileSync('./controllers/config.json', 'utf8'));
module.exports  =  object;
