const http = require('http');
const path = require('path');
const fs = require('fs/promises');

const app = http.createServer(async (request, response) => {
  console.log('Entro al servidor');
  const requestMethod = request.method;
  const requestURL = request.url;

  if (requestURL === '/api/v1/tasks') {
    // console.log(requestMethod, requestURL);
    if (requestMethod === 'GET') {
      const jsonPath = path.resolve('./data.json');
      const jsonFile = await fs.readFile(jsonPath, 'utf8');
      response.setHeader('Content-Type', 'application/json');
      response.writeHead('200');
      response.write(jsonFile);
    }

    if (requestMethod === 'POST') {
      const jsonPath = path.resolve('./data.json');
      const jsonFile = await fs.readFile(jsonPath, 'utf8');
      const fileArray = JSON.parse(jsonFile);
      request.on("data", (data) => {
        const newTask = JSON.parse(data);
        console.log(newTask);
        const newTaskWithId = {
          id: fileArray[fileArray.length - 1].id + 1,
          ...newTask
        }
        console.log(newTaskWithId);
        fileArray.push(newTaskWithId);
        console.log(fileArray);
        fs.writeFile(path.resolve('./data.json'), JSON.stringify(fileArray));
        response.writeHead(201);
      });
    }

    if (requestMethod === 'DELETE') {
      request.on("data", (data) => {
        const parsed = JSON.parse(data);
        console.log(parsed);
      })
    }
  } else {
    if (!isNaN(parseInt(requestURL.split("/")[requestURL.split("/").length - 1]))) {
      const jsonPath = path.resolve('./data.json');
      const jsonFile = await fs.readFile(jsonPath, 'utf8');
      const fileArray = JSON.parse(jsonFile);
      const id = parseInt(requestURL.split("/")[requestURL.split("/").length - 1]);

      if (requestMethod === 'PUT') {
        request.on("data", (data) => {
          const parsed = JSON.parse(data);
          const newFileArray = JSON.stringify(fileArray.map(task => (
            {
              ...task,
              ...(task.id == id && parsed)
            }
          )));
          fs.writeFile(path.resolve('./data.json'), newFileArray);
          response.writeHead(201);
        })
      }

      if (requestMethod === 'DELETE') {
        fs.writeFile(path.resolve('./data.json'), JSON.stringify(fileArray.filter(task => task.id != id)));
        response.writeHead(200)
      }

    } else {
      response.writeHead(503);
    }
  }

  response.end();
});

const PORT = 8000;

app.listen(PORT);

