import { createServer } from 'http'
import { createReadStream } from 'fs'
import { join } from 'path'

const server = createServer((req, res) => {
  const filePath = req.url === '/' ? 'index.html' : req.url
  createReadStream(join('dist', filePath))
    .on('error', () => {
      // If file not found, serve index.html for SPA routing
      createReadStream(join('dist', 'index.html')).pipe(res)
    })
    .pipe(res)
})

server.listen(process.env.PORT || 3000)
