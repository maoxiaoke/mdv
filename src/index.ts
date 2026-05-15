import { createServer } from 'node:http';

const port = Number(process.env.PORT ?? 3000);

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(
    JSON.stringify(
      {
        ok: true,
        message: 'mdv is running',
        method: req.method,
        url: req.url,
      },
      null,
      2,
    ) + '\n',
  );
});

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
