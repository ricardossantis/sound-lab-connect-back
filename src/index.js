const express = require("express");
const { client } = require('./db/redis');
const app = express();

client.connect();

app.get('/store/:key', async (req, res) => {
  const { key } = req.params;
  const value = req.query;
  await client.set(key, JSON.stringify(value));
  return res.send('Success');
});

app.get('/:key', async (req, res) => {
  const { key } = req.params;
  const rawData = await client.get(key);
  return res.json(JSON.parse(rawData));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

