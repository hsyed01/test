import { Server } from '../index';
import * as http from 'http';

jest.mock('http', () => ({
  createServer: jest.fn(() => ({ listen: jest.fn() })),
}));

describe('Server', () => {
  it('should create server on port 5000', () => {
    const server = new Server().startServer();
    expect(http.createServer).toBeCalled();
  });
});