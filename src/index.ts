import { createServer, IncomingMessage, ServerResponse } from 'http';
import axios from 'axios';
const url = require('url');

const port = 5000;
const BASE_URL = 'https://api.github.com/repos/';
export const axiosServices = axios.create({
  baseURL: BASE_URL,
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

      const queryURL = url.parse(req.url, true).query['url'];

      const gitURL = queryURL.replace (/^[a-z]{4}\:\/{2}[a-z]{1,}\:[0-9]{1,4}.(.*)/, '$1');
      // Create a regex to match protocol, domain, and host
      const matchProtocolDomainHost = /^.*\/\/[^\/]+:?[0-9]?\//i;
      // Replace protocol, domain and host from url, assign to `userRepoUrl`
      const userRepoUrl = gitURL?.replace(matchProtocolDomainHost, '');

      if (userRepoUrl !== '/') {
        if (req.method === 'GET') {
          axiosServices.get(userRepoUrl + '/pulls')
          .then(async (prResInfo: any) => {
            let prCommitsData: any[] = await Promise.all(
              prResInfo.map((pr: any, index: number) => {
                return new Promise((resolve, reject) => {
                  const commitsUrl = pr.commits_url.replace(BASE_URL, '');
                  axiosServices.get(commitsUrl)
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
        else {
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