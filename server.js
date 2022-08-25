import { createServer } from 'http';
import {
  readFile, readFileSync,
} from 'fs';
import { extname } from 'path';
import { parse } from 'url';
import * as qs from 'querystring';
import Datastore from './datastore.js';

const port = process.env.PORT || 8080;

createServer(async (request, response) => {
  const { pathname } = parse(request.url);

  if (request.method === 'GET' && pathname === '/version') {
    const packageJson = JSON.parse(readFileSync('package.json'));
    response.writeHead(200, { 'content-type': 'application/text' });
    response.end(packageJson.version);
    return;
  }

  if (request.method === 'GET' && pathname === '/scores') {
    const allScores = await Datastore.getScores();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(allScores.slice(0, 5), 'utf-8'));
  } else if (request.method === 'POST' && pathname === '/scores') {
    const { query } = parse(request.url);
    const { name } = qs.parse(query);
    const score = parseInt(qs.parse(query).score, 10);

    if (name.length > 3 || name.length < 1 || Number.isNaN(score) || score < 0) {
      response.writeHead(400);
      response.end('name must be 3 or fewer characters, score must be positive integer', 'utf-8');
      return;
    }
    await Datastore.setScore(name, score);
    response.writeHead(201);
    response.end();
  } else {
    let filePath = `.${request.url}`;
    if (filePath === './') filePath = './index.html';

    const extName = extname(filePath);
    let contentType = 'text/html';
    switch (extName) {
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
      default:
        contentType = 'default';
    }

    readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          readFile('./404.html', (_, content404) => {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content404, 'utf-8');
          });
        } else {
          response.writeHead(500);
          response.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
          response.end();
        }
      } else {
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(content, 'utf-8');
      }
    });
  }
}).listen(port);
console.log(`Server running at http://127.0.0.1:${port}`);
