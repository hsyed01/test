import { createServer, IncomingMessage, ServerResponse } from 'http';
import { getReqUrl, getReqData } from './data';
const port = 5000;

export const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {

  const userRepoUrl = getReqUrl(req);

  if (userRepoUrl !== '/') {
    if (req.method === 'GET') {
      const data: any = await getReqData(userRepoUrl);
      if (data.type === 'success'){
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(data.value);
        res.end();
      } else {
        res.statusCode = 500;
        res.write("You can not access an api url!");
        res.end();
      }
    }
    else {
      res.statusCode = 404;
      res.end();
    }
  }
});  

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});