const emitFeedItems = require('../handlers/feedHandler');
const {describe, expect, it} = require('@jest/globals');


describe('sum module', () => {
  it('Should test happy path feeds has items', async () => {
    const feeds = [{id: 1, content: "test content"}];
    const userId = "test_user_id";
    const mainQueue = "test_main_queue";
    const socketIO = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
    await emitFeedItems(feeds, userId, mainQueue, socketIO);
    expect(socketIO.to).toHaveBeenCalledWith(userId);
    expect(socketIO.emit).toHaveBeenCalledWith(`${mainQueue}-feed`, JSON.stringify(feeds[0]));
  });
});