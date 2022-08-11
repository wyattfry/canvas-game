var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
const qs = require('querystring');

const port = process.env.PORT || 8080

http.createServer(function (request, response) {
    console.log('request starting...');

    const { pathname } = url.parse(request.url)

    if (request.method === 'GET' && pathname === '/scores') {
        try {
            fs.accessSync('leaderboard.json', fs.constants.R_OK | fs.constants.W_OK);
        } catch (err) {
            fs.writeFileSync('leaderboard.json', '[]')
        }
        const leaderboard = JSON.parse(fs.readFileSync('leaderboard.json', { encoding: 'utf8' }))
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(leaderboard), 'utf-8');
    }

    if (request.method === 'POST' && pathname === '/scores') {
        const { query } = url.parse(request.url)
        let { name, score } = qs.parse(query)
        score = parseInt(score)

        if (name.length > 3 || name.length < 1 || isNaN(score) || score < 0 ) {
            response.writeHead(400);
            response.end('name must be 3 or fewer characters, score must be positive integer', 'utf-8');
            return
        }

        try {
            fs.accessSync('leaderboard.json', fs.constants.R_OK | fs.constants.W_OK);
        } catch (err) {
            fs.writeFileSync('leaderboard.json', '[]')
        }
        const leaderboard = JSON.parse(fs.readFileSync('leaderboard.json', { encoding: 'utf8' }))
        leaderboard.push([name, score])
        const sorted = leaderboard
            .sort((recordA, recordB) => recordB[1] - recordA[1])
            .slice(0, 10)
        fs.writeFileSync('leaderboard.json', JSON.stringify(sorted))
    }

    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }

    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile('./404.html', function (error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                response.end();
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

}).listen(port);
console.log('Server running at http://127.0.0.1:' + port);
