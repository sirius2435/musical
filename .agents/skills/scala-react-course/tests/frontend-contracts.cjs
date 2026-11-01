const assert = require('node:assert/strict')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { GetBookAPI } = require('./build/apis/books/GetBookAPI')
const { ListBooksAPI } = require('./build/apis/books/ListBooksAPI')
const { RenameBookAPI } = require('./build/apis/books/RenameBookAPI')
const { filterBooks } = require('./build/pages/BookList/functions/filterBooks')
const { BookResultsPanel } = require('./build/pages/BookList/components/BookResultsPanel')
const { getCurrentUser, setCurrentUser } = require('./build/pages/stores/currentUser')
const { default: Account } = require('./build/pages/Account')

async function main() {
  const requests = []
  const book = { id: { value: 'b-1' }, title: 'Scala' }
  global.localStorage = { getItem: () => 'test-token' }
  global.fetch = async (url, init) => {
    requests.push({ url, body: JSON.parse(init.body), signal: init.signal })
    return Response.json(url.endsWith('listbooksapi') ? { books: [book] } : book)
  }
  assert.deepEqual(await new GetBookAPI(book.id).send(), book)
  assert.equal(requests[0].url, '/api/getbookapi')
  assert.deepEqual(requests[0].body, { bookId: book.id })
  assert.deepEqual(await new ListBooksAPI().send(), { books: [book] })
  assert.equal(requests[1].url, '/api/listbooksapi')
  assert.deepEqual(requests[1].body, {})
  const controller = new AbortController()
  await new RenameBookAPI(book.id, 'New title').send(controller.signal)
  assert.equal(requests[2].url, '/api/renamebookapi')
  assert.deepEqual(requests[2].body, { bookId: book.id, title: 'New title', userToken: 'test-token' })
  assert.ok(!('userId' in requests[2].body))
  assert.ok(!('responseType' in requests[2].body))
  assert.equal(requests[2].signal, controller.signal)
  global.fetch = async () => Response.json({ message: '权限不足' }, { status: 403 })
  await assert.rejects(new RenameBookAPI(book.id, 'x').send(), /权限不足/)
  global.fetch = async () => new Response('invalid json', { status: 502 })
  await assert.rejects(new GetBookAPI(book.id).send(), /502/)
  const frozen = Object.freeze([Object.freeze(book)])
  assert.deepEqual(filterBooks(frozen, ' sCaLa '), [book])
  assert.deepEqual(filterBooks(frozen, 'missing'), [])
  assert.equal(filterBooks(frozen, ''), frozen)
  const panel = (state, books = []) => renderToStaticMarkup(
    React.createElement(BookResultsPanel, { state, books, onRetry: () => {} }),
  )
  assert.match(panel({ status: 'loading' }), /role="status"/)
  assert.match(panel({ status: 'empty' }), /暂无图书/)
  assert.match(panel({ status: 'error', message: '<failed>' }), /&lt;failed&gt;/)
  assert.match(panel({ status: 'error', message: 'failed' }), /重试/)
  assert.match(panel({ status: 'ready', books: [book] }, [book]), /Scala/)
  assert.match(panel({ status: 'ready', books: [book] }), /没有符合筛选条件/)
  setCurrentUser(null)
  const previousSnapshot = getCurrentUser()
  assert.match(renderToStaticMarkup(React.createElement(Account)), /未登录/)
  setCurrentUser({ username: 'Alice', role: 'reader' })
  assert.equal(getCurrentUser().username, 'Alice')
  assert.equal(previousSnapshot, null)
  // useStore's server snapshot is its initial state; SSR cannot prove a mounted subscription update.
  assert.match(renderToStaticMarkup(React.createElement(Account)), /未登录/)
  setCurrentUser(null)
  assert.match(renderToStaticMarkup(React.createElement(Account)), /未登录/)
  console.log('PASS: API payloads/names/errors/signal, pure filtering, page branches, Zustand setters/snapshots and initial SSR')
  console.log('Scope: fetch mocks and static render; not mounted reactive UI or a production browser build')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
