import { createServer, IncomingMessage, ServerResponse } from 'http';
import axios from 'axios';

const port = 5000;

const axiosServices = axios.create({
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'Access-Control-Allow-Origin': '*'
  }
});

// response
axiosServices.interceptors.response.use(
  (response) => {
    const res = response.data;
    return Promise.resolve(res);
  },
  (error) => Promise.reject(error)
);

export class Server {
  public startServer() {
    createServer((req: IncomingMessage, res: ServerResponse) => {
      switch (req.url) {
        case '/': {
          if (req.method === 'GET') {
            axiosServices.get('https://api.github.com/repos/colinhacks/zod/pulls')
            .then(async (prResInfo: any) => {
              let prCommitsData: any[] = await Promise.all(
                prResInfo.map((pr: any, index: number) => {
                  return new Promise((resolve, reject) => {
                    axiosServices.get(pr.commits_url)
                    .then((prCommitsResInfo: any) => {
                      resolve({
                        type: 'success',
                        value: { 
                          commitsUrl: pr.commits_url,
                          commitsCount: prCommitsResInfo.length
                        }
                      });
                    }).catch((error: any) => {
                      reject({
                        type: 'failure',
                        error
                      });
                    });
                  });
                })
              );
              console.log('<-------Pull Request Info---->', prResInfo);
              console.log('<-------Commits Info for every Pull Request---->', prCommitsData);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.write(JSON.stringify({prResInfo, prCommitsData}));
              res.end();
            })
            .catch(error => {
              console.log(error);
            });
          }
          break;
        }
        default: {
          res.statusCode = 404;
          res.end();
        }
      }
    }).listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }
}

const server = new Server();

server.startServer();