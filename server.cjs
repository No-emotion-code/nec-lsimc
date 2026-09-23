const http = require('node:http')
const fs = require('node:fs/promises')
const path = require('node:path')

const port = Number(process.env.PORT || process.env.API_PORT || 8787)
const dataPath = path.join(__dirname, 'data', 'election.json')
const distPath = path.join(__dirname, 'dist')

async function readState() {
  return JSON.parse(await fs.readFile(dataPath, 'utf8'))
}

async function writeState(state) {
  await fs.writeFile(dataPath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.url === '/health') {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ status: 'ok' }))
      return
    }

    if (request.url !== '/api/state') {
      const requestedPath = request.url === '/' ? '/index.html' : request.url.split('?')[0]
      const filePath = path.normalize(path.join(distPath, requestedPath))
      if (!filePath.startsWith(distPath)) {
        response.writeHead(403)
        response.end('Forbidden')
        return
      }
      const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }
      const content = await fs.readFile(filePath)
      response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' })
      response.end(content)
      return
    }

    response.setHeader('Content-Type', 'application/json')
    if (request.method === 'GET') {
      response.end(JSON.stringify(await readState()))
      return
    }

    if (request.method === 'PUT') {
      let body = ''
      for await (const chunk of request) body += chunk
      const incoming = JSON.parse(body)
      const state = await readState()
      const nextState = {
        accounts: Array.isArray(incoming.accounts) ? incoming.accounts : state.accounts,
        candidates: Array.isArray(incoming.candidates) ? incoming.candidates : state.candidates,
      }
      await writeState(nextState)
      response.end(JSON.stringify(nextState))
      return
    }

    response.writeHead(405)
    response.end(JSON.stringify({ error: 'Method not allowed' }))
  } catch (error) {
    response.writeHead(500)
    response.end(JSON.stringify({ error: error.message }))
  }
})

server.listen(port, () => {
  console.log(`JSON election API running at http://localhost:${port}`)
})
