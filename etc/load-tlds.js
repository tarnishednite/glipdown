var http = require('http'),
   fs = require('fs'),
   events = require('events');

var md5file = './md5',
   tmpfile = './tlds.js.tmp',
   file = './tlds.js',
   md5Cloud = null,
   md5Local = null;

var MD5 = function() {};
MD5.prototype = new events.EventEmitter;
var md5 = new MD5();

var getMD5 = function()
{
   http.get('http://data.iana.org/TLD/tlds-alpha-by-domain.txt.md5', function(response)
   {
      var md5Chunk = '';
      response.on('data', function(chunk) {
         md5Chunk += chunk;
      });
      response.on('end', function() {
         if ( response.statusCode === 200 ) {
            md5Cloud = md5Chunk.match(/^\w+/);
            md5.emit('done');
            /* move this part
            */
         }
         else
         {
            console.log('MD5 retrieval failed with '+response.statusCode);
            md5Cloud = 'failed'; // needs to still be different, but shouldn't prevent downloading the file
            md5.emit('done');
         }
      });
      response.on('error', function(error)
      {
         console.log(error);
         md5Cloud = 'failed'; // needs to still be different, but shouldn't prevent downloading the file
         md5.emit('done');
      });
   });
}

var getLocal = function()
{
   fs.stat(md5file, function(error, stat) {
      if ( error !== null )
      {
         md5Local = 'false'; // doesn't actually matter what this is
         md5.emit('done');
      }
      else
      {
         fs.readFile(md5file, function (error, data) {
            if ( error !== null )
            {
               md5Local = 'false'; // once again does not matter
               md5.emit('done');
               return;
            }
            md5Local = data; 
            md5.emit('done');
         });
      }
   });
}

var buildTLD = function()
{
   http.get('http://data.iana.org/TLD/tlds-alpha-by-domain.txt', function(response)
   {
      var tld = '';
      response.on('data', function(chunk) {
         tld += chunk;
      });
      response.on('end', function() {
         if ( response.statusCode === 200 ) {
            var objfs = fs.createWriteStream(tmpfile);
            var outputStr = 'module.exports = {';
            var cnt = 0;
            tld.split("\n").forEach(function(line){
               if ( line.match(/^\#/) ) return;
               outputStr += (cnt > 0 ? ',' : '') + '\''+line.toLowerCase()+'\''+':true';
               cnt++;
            });

            outputStr += '};';
            objfs.write(outputStr);
            objfs.close();

            fs.rename(tmpfile,file);

            objfs.on('error', function (error) {
               console.log(error);
               objfs.close();
               process.exit();
            });
         }
         else
         {
            console.log('UNABLE to get TLD file: '+response.statusCode);
         }
      });
      response.on('error', function(error)
      {
         console.log(error);
      });
   });
}

md5.on('done',function()
{
   if ( md5Cloud !== null && md5Local !== null && 
         md5Local.toString() !== md5Cloud.toString() )
   {
      buildTLD();
      var md5fs = fs.createWriteStream(md5file);
      md5fs.on('error', function (error) {
         console.log('An error has occurred, but it won\'t hurt anything.');
         console.log(error);
      });
      md5fs.write(md5Cloud.toString());
      md5fs.end();
   }
   if ( md5Cloud !== null && md5Local !== null && 
         md5Local.toString() === md5Cloud.toString() )
   {
      console.log('NO Change to file');
   }
});

if ( !process.cwd().match(/etc$/) )
{
   process.chdir('./etc');
}

getMD5();
getLocal();
