"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var axios_1 = __importDefault(require("axios"));
var port = 5000;
var axiosServices = axios_1.default.create({
    headers: {
        'Accept': 'application/vnd.github.v3+json'
    }
});
// response
axiosServices.interceptors.response.use(function (response) {
    var res = response.data;
    return Promise.resolve(res);
}, function (error) { return Promise.reject(error); });
var server = (0, http_1.createServer)(function (req, res) {
    switch (req.url) {
        case '/': {
            if (req.method === 'GET') {
                var prCommitsData_1 = [];
                axiosServices.get('https://api.github.com/repos/colinhacks/zod/pulls')
                    .then(function (pullRequestResponseInfo) {
                    prCommitsData_1 = pullRequestResponseInfo.map(function (pr, index) {
                        axiosServices.get(pr.commits_url)
                            .then(function (pullReqestCommitsResInfo) { return ({
                            commitsUrl: pr.commits_url,
                            commitsCount: pullReqestCommitsResInfo.length
                        }); });
                    });
                    console.log('<-------Pull Request Info---->', pullRequestResponseInfo);
                    console.log('<-------Commits Info for every Pull Request---->', prCommitsData_1);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify(prCommitsData_1));
                    res.end();
                })
                    .catch(function (error) {
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
});
server.listen(port, function () {
    console.log("Server listening on port " + port);
});
