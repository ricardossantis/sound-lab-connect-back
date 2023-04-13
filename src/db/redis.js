const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient({ socket: { host: REDIS_HOST, port: REDIS_PORT }});

client.on('error', err => console.log('Redis Client Error', err));


module.exports = {
  client
};