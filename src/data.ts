import { IncomingMessage } from 'http';
import axios from 'axios';

const url = require('url');
const BASE_URL = 'https://api.github.com/repos/';

export const axiosServices = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'Access-Control-Allow-Origin': '*'
  }
});

axiosServices.interceptors.response.use(
  (response) => {
    const res = response.data;
    return Promise.resolve(res);
  },
  (error) => Promise.reject(error)
);

export function getReqUrl(req: IncomingMessage) {
  const queryURL = url.parse(req.url, true).query['url'];
  const gitURL = queryURL.replace (/^[a-z]{4}\:\/{2}[a-z]{1,}\:[0-9]{1,4}.(.*)/, '$1');
  const matchProtocolDomainHost = /^.*\/\/[^\/]+:?[0-9]?\//i;
  return gitURL?.replace(matchProtocolDomainHost, '');
};

export function getReqData(url: string) {
  return new Promise((resolve) => {
    axiosServices.get(url + '/pulls')
    .then(async (prResInfo: any) => {
      let prCommitsData: any[] = await Promise.all(
        prResInfo.map((pr: any) => {
          return new Promise((resolve) => {
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
              resolve({
                type: 'failure',
                error
              });
            });
          });
        })
      );
      resolve({
        type: 'success',
        value: JSON.stringify({ prResInfo, prCommitsData })
      });
    })
    .catch(error => {
      resolve({
        type: 'failure',
        error: JSON.stringify(error)
      });
    });
  });
};
