const { emitFeedItems } = require('../handlers/feedHandler');
const {describe, expect, it} = require('@jest/globals');


describe('Emit feed items', () => {
  it('Should emit event if feeds has items', async () => {
    const feeds = [{id: 1, content: "test content"}];
    const userId = "test_user_id";
    const mainQueue = "test_main_queue";
    const socketIO = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
    await emitFeedItems(feeds, userId, mainQueue, socketIO);
    expect(socketIO.to).toHaveBeenCalledWith(userId);
    expect(socketIO.emit).toHaveBeenCalledWith(`${mainQueue}-feed`, JSON.stringify(feeds[0]));
  });

  it("Should not emit event if feeds array is empty", async () => {
    const feeds = [];
    const userId = "test_user_id";
    const mainQueue = "test_main_queue";
    const socketIO = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
    await emitFeedItems(feeds, userId, mainQueue, socketIO);
    expect(socketIO.to).not.toHaveBeenCalled();
    expect(socketIO.emit).not.toHaveBeenCalled();
  });
});