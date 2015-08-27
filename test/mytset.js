var Markdown = require('../markdown').Markdown;
console.log('hello world');
var testString = 'https://www.google.com/ google.co.uk play.something.com are all links foo.bar.baz is not';
var marked = Markdown(testString, {});
console.log(marked);
testString = 'but what about play.google.com? And then we could have a deep link '+
'google.com/?q=test%20query or www.movietickets.com/theater/hid/537';
marked = Markdown(testString, {});
console.log(marked);
testString = ' and what about ftp://192.168.2.2/ or 192.168.7.1 or http://192.168.34.34';
marked = Markdown(testString, {});
console.log(marked);
