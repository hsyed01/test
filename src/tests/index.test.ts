var http = require('http');
import mock from 'mock-http';
import { getReqUrl, getReqData } from '../data';
import { returnFailureData, returnSuccessData } from './returnData';


jest.mock('http', () => ({
  createServer: jest.fn(() => ({ listen: jest.fn() })),
}));

const axios = {
  get: jest.fn(() => Promise.resolve({ data: {} }))
};

describe('Server', () => {
  afterEach(() => {
    jest.resetModules();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should create server on port 5000', () => {
    const mError = new Error('network');
    const mServer: any = {
      listen: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementationOnce((event, handler) => {
        handler(mError);
      }),
    };
    const createServerSpy = jest.spyOn(http, 'createServer').mockImplementationOnce(() => mServer);
    require('../index');
    expect(createServerSpy).toBeCalledTimes(1);
    expect(mServer.listen).toBeCalledWith(5000, expect.any(Function));
  });

  it('returns git username info from request url', () => {
    const testRequest = new mock.Request({
      url: '/?url=https://github.com/colinhacks/zod',
      method: 'GET',
      buffer: Buffer.from('name=mock&version=first')
    });
    const url = getReqUrl(testRequest);
    expect(url).toEqual('colinhacks/zod');
  });

  it("returns pull request and commits data.", async () => {
    const data: any = await getReqData('colinhacks/zod');
    switch (data.type) {
      case 'failure':
        expect(JSON.parse(data.error).message).toEqual("Request failed with status code 403");
        break;
      case 'success':
        expect(JSON.parse(data.value).prCommitsData[0].value).toEqual(returnSuccessData.prCommitsData[0].value);
        break;
      default:
        break;
    }
  });
});
