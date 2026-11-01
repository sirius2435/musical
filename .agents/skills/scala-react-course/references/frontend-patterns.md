# 前端模式：API 契约与页面状态

对应规则 19、39–60。编码前读 [原文](rules.txt)；Lec5 整理内容与本次明确要求的映射见 [来源表 FE01–FE08](sources-and-conflicts.md)。下面用一个简化的图书页面说明边界，复杂页面按同样原则增加实际业务区域；简单页面不必照搬所有文件。

## 状态与职责前提（FE01–FE03）

常量是不随交互变化的配置；核心数据是用户或外部事件直接改变的事实；展示型数据由核心数据纯计算得到。核心状态变化后，让 Hook/Store 订阅与 React 渲染重新计算展示值，不额外保存过滤列表或显示标题的副本。

Hooks 管理状态、共享关系与外部同步，普通纯函数负责转换，组件负责展示和事件连接。不用模块级 let 或挂在 window 上的非响应式可变变量管理页面状态；模块常量及封装好的 Zustand Store 不因此被禁止。useEffect 用于必要外部同步，不用于把可直接推导的数据同步到第二份 state。课程前端优先 TypeScript + React；不凭本参考迁移无关项目。

## 1. 服务对象和数据契约（规则 48–49、57–58）

这些类型与 [后端示例](backend-patterns.md) 一致：ID 是对象，查询响应是单本记录，列表响应是 `{books: [...]}`。这不是全项目必须采用的 ID 形态；已有字符串 ID 契约应继续保持字符串。

`src/objects/books/BookId.ts`：

```ts
export interface BookId {
  readonly value: string
}
```

`src/objects/books/BookRecord.ts`：

```ts
import type { BookId } from './BookId'

export interface BookRecord {
  readonly id: BookId
  readonly title: string
}
```

`src/objects/books/apiTypes/BookListResponse.ts`：

```ts
import type { BookRecord } from '../BookRecord'

export interface BookListResponse {
  readonly books: readonly BookRecord[]
}
```

## 2. 通用 API 基础设施（规则 31、50–53）

命名、发送和令牌处理位于服务目录之外。这里选择类型名推导路由，生产构建必须保留相应类名，或沿用项目已有的编译期推导机制。不要在每个调用器另写路由字符串。必须实际检查构建产物，不能只验证开发服务器。

`src/system/api/APIMessage.ts`：

```ts
export abstract class APIMessage<Response> {
  declare readonly responseType: Response

  get needsUserToken(): boolean {
    return false
  }

  abstract send(signal?: AbortSignal): Promise<Response>
}
```

`src/system/api/APIWithTokenMessage.ts`：

```ts
import { APIMessage } from './APIMessage'

export abstract class APIWithTokenMessage<Response> extends APIMessage<Response> {
  override get needsUserToken(): boolean {
    return true
  }
}
```

`src/system/api/apiNameOf.ts`：

```ts
import type { APIMessage } from './APIMessage'

export function apiNameOf(message: APIMessage<unknown>): string {
  return message.constructor.name.toLowerCase()
}
```

`src/system/api/authToken.ts`：

```ts
export function getAuthToken(): string | null {
  return localStorage.getItem('course-user-token')
}
```

令牌读取只演示现有项目采用 body token 时的调用方式，不规定必须使用 localStorage。已有 cookie、会话或其他方案时复用其基础设施，不能自行更换存储方式。不要把 token 放入页面渲染、日志或报错内容。

`src/system/api/readAPIError.ts`：

```ts
export async function readAPIError(response: Response): Promise<Error> {
  const fallback = `请求失败：${response.status}`

  try {
    const payload: unknown = await response.json()
    const message =
      typeof payload === 'object' && payload !== null &&
      'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : fallback
    return new Error(message)
  } catch {
    return new Error(fallback)
  }
}
```

`src/system/api/sendAPI.ts`：

```ts
import type { APIMessage } from './APIMessage'
import { apiNameOf } from './apiNameOf'
import { getAuthToken } from './authToken'
import { readAPIError } from './readAPIError'

export async function sendAPI<Result>(
  message: APIMessage<Result>,
  signal?: AbortSignal,
): Promise<Result> {
  const body = message.needsUserToken
    ? { ...message, userToken: getAuthToken() ?? '' }
    : message
  const response = await fetch(`/api/${apiNameOf(message)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    throw await readAPIError(response)
  }

  return response.json() as Promise<Result>
}
```

本组接口成功响应都有 JSON body；不要复制该假设到返回 204、文件或流的接口。TypeScript 的返回类型断言不构成运行时 JSON 校验；项目已有 schema/codec 时复用，至少验证真实请求响应形态。

## 3. 服务调用器（规则 48–53）

采用规则 52 推荐的简洁 class + send 模式。原文是推荐风格，不应仅因为现有项目使用等价的类型化发送函数，就宣布强制违规。这里不用泛型框架隐藏输入字段。

`src/apis/books/GetBookAPI.ts`：

```ts
import type { BookId } from '../../objects/books/BookId'
import type { BookRecord } from '../../objects/books/BookRecord'
import { APIMessage } from '../../system/api/APIMessage'
import { sendAPI } from '../../system/api/sendAPI'

export class GetBookAPI extends APIMessage<BookRecord> {
  readonly bookId: BookId

  constructor(bookId: BookId) {
    super()
    this.bookId = bookId
  }

  send(signal?: AbortSignal): Promise<BookRecord> {
    return sendAPI(this, signal)
  }
}
```

`src/apis/books/ListBooksAPI.ts`：

```ts
import type { BookListResponse } from '../../objects/books/apiTypes/BookListResponse'
import { APIMessage } from '../../system/api/APIMessage'
import { sendAPI } from '../../system/api/sendAPI'

export class ListBooksAPI extends APIMessage<BookListResponse> {
  send(signal?: AbortSignal): Promise<BookListResponse> {
    return sendAPI(this, signal)
  }
}
```

`src/apis/books/RenameBookAPI.ts`：

```ts
import type { BookId } from '../../objects/books/BookId'
import type { BookRecord } from '../../objects/books/BookRecord'
import { APIWithTokenMessage } from '../../system/api/APIWithTokenMessage'
import { sendAPI } from '../../system/api/sendAPI'

export class RenameBookAPI extends APIWithTokenMessage<BookRecord> {
  readonly bookId: BookId
  readonly title: string

  constructor(bookId: BookId, title: string) {
    super()
    this.bookId = bookId
    this.title = title
  }

  send(signal?: AbortSignal): Promise<BookRecord> {
    return sendAPI(this, signal)
  }
}
```

前端不发送认证用 userId；后端路由从 token 得到可信身份。字段相同不是安全目标，信任转换才是。管理员权限继续在业务流程中检查。

## 4. 页面骨架、状态和纯函数（规则 39–47、60）

复杂页面可以继续拆分阅读、选择、草稿、检查、确认和历史等区域。下面只演示工具栏与结果区，页面本身并不需要递归嵌套。

`src/pages/BookList/objects/BookListPageState.ts`：

```ts
import type { BookRecord } from '../../../objects/books/BookRecord'

export type BookListPageState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly books: readonly BookRecord[] }
  | { readonly status: 'empty' }
  | { readonly status: 'error'; readonly message: string }
```

`src/pages/BookList/functions/filterBooks.ts`：

```ts
import type { BookRecord } from '../../../objects/books/BookRecord'

export function filterBooks(
  books: readonly BookRecord[],
  keyword: string,
): readonly BookRecord[] {
  const normalized = keyword.trim().toLowerCase()
  return normalized === ''
    ? books
    : books.filter(book => book.title.toLowerCase().includes(normalized))
}
```

`src/pages/BookList/hooks/useBookList.ts`：

```ts
import { useEffect, useState } from 'react'
import { ListBooksAPI } from '../../../apis/books/ListBooksAPI'
import { filterBooks } from '../functions/filterBooks'
import type { BookListPageState } from '../objects/BookListPageState'

export function useBookList() {
  const [state, setState] = useState<BookListPageState>({ status: 'loading' })
  const [keyword, setKeyword] = useState('')
  const [refreshVersion, setRefreshVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    void new ListBooksAPI().send(controller.signal).then(response => {
      if (!controller.signal.aborted) {
        setState(response.books.length === 0
          ? { status: 'empty' }
          : { status: 'ready', books: response.books })
      }
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : '加载失败',
        })
      }
    })

    return () => controller.abort()
  }, [refreshVersion])

  const reload = () => {
    setState({ status: 'loading' })
    setRefreshVersion(version => version + 1)
  }

  const visibleBooks = filterBooks(state.status === 'ready' ? state.books : [], keyword)

  return { state, keyword, setKeyword, visibleBooks, reload }
}
```

这里 useEffect 同步服务器数据，不用它计算筛选结果。请求取消后不更新状态，防止卸载或刷新后的旧请求覆盖新状态。更复杂的分页、乐观更新、并发写入沿用项目的数据访问机制，不据此自建通用状态框架。

`src/pages/BookList/components/BookToolbar.tsx`：

```tsx
interface BookToolbarProps {
  readonly keyword: string
  readonly isLoading: boolean
  readonly onKeywordChange: (value: string) => void
  readonly onReload: () => void
}

export function BookToolbar(props: BookToolbarProps) {
  return (
    <section className="flex flex-wrap items-end gap-3" aria-label="图书筛选">
      <label className="flex flex-col gap-1">
        <span className="text-sm">搜索书名</span>
        <input
          className="rounded border px-3 py-2"
          value={props.keyword}
          onChange={event => props.onKeywordChange(event.target.value)}
        />
      </label>
      <button
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        disabled={props.isLoading}
        onClick={props.onReload}
        type="button"
      >刷新</button>
    </section>
  )
}
```

`src/pages/BookList/components/BookResultsPanel.tsx`：

```tsx
import type { BookRecord } from '../../../objects/books/BookRecord'
import type { BookListPageState } from '../objects/BookListPageState'

interface BookResultsPanelProps {
  readonly state: BookListPageState
  readonly books: readonly BookRecord[]
  readonly onRetry: () => void
}

export function BookResultsPanel({ state, books, onRetry }: BookResultsPanelProps) {
  switch (state.status) {
    case 'loading':
      return <p role="status">正在加载图书…</p>
    case 'error':
      return (
        <section className="space-y-3" aria-label="加载失败">
          <p role="alert">{state.message}</p>
          <button className="rounded border px-3 py-2" type="button" onClick={onRetry}>重试</button>
        </section>
      )
    case 'empty':
      return <p>暂无图书。</p>
    case 'ready':
      return books.length === 0
        ? <p>没有符合筛选条件的图书。</p>
        : <ul className="grid gap-3 sm:grid-cols-2">{books.map(book => (
          <li className="rounded border p-4" key={book.id.value}>{book.title}</li>
        ))}</ul>
    default: {
      const unreachable: never = state
      return unreachable
    }
  }
}
```

`src/pages/BookList/index.tsx`：

```tsx
import { BookResultsPanel } from './components/BookResultsPanel'
import { BookToolbar } from './components/BookToolbar'
import { useBookList } from './hooks/useBookList'

export default function BookList() {
  const page = useBookList()

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">图书目录</h1>
      <BookToolbar
        keyword={page.keyword}
        isLoading={page.state.status === 'loading'}
        onKeywordChange={page.setKeyword}
        onReload={page.reload}
      />
      <BookResultsPanel state={page.state} books={page.visibleBooks} onRetry={page.reload} />
    </main>
  )
}
```

以上 props 接口只服务所在小组件，放在同一文件是简单 TypeScript 写法；页面级共享状态对象单独放 objects。不要为了每个局部类型都增加文件而提高查找成本。

## 5. 共享与样式的适用边界

- 本次 V2 将 Zustand 定位为跨页面共享的全局核心数据；不要过度使用。同页交互优先局部 Hook/页面协调 Hook；用户提供的旧手册描述更宽泛，差异和待核原文见来源表 C04。不要据此无关地重构所有已有 Store。
- Store 尽量保持模块私有，对外提供清楚的 get/use/set。get 是时刻快照，use 是响应式订阅，set 是状态更新。纯函数不调用 use；组件渲染不以 get 代替订阅。事件处理器需要一次性快照时可以用 get。
- 局部状态保留在组件或页面。小表单可使用清楚的 pending/error 状态，不要求庞大状态联合。
- 派生展示数据通过纯函数计算；只有确有收益时使用 useMemo，避免把筛选结果复制进状态。
- 跨页面共享对象放在明确的页面级位置，例如 pages/objects；领域类型保持服务归属。
- 全局 components 保留广泛复用的 UI 基础组件，业务卡片和区域放页面附近。复用第三方基础组件时沿用现有体系。
- 遵守 Tailwind；主题变量、第三方库必须的样式或无法合理用工具类表达的需求可保留必要 CSS，并说明原因。不要按文件扩展名直接删除仍被引用的样式。
- 清理确实未使用的资源和脚手架。具体 UI 样式不是这份示例规定的项目视觉设计。

## 6. 跨页面 Store 示例（FE04–FE06）

实际学生样例的 session-store 使用私有 const Store、useStore 订阅和公开更新函数；见证据快照 S:ZUSTAND。下面补足 get/use/set 的职责演示，不要求其名称成为所有项目唯一命名。

`src/pages/objects/CurrentUser.ts`：

```ts
export interface CurrentUser {
  readonly username: string
  readonly role: 'reader' | 'admin'
}
```

该对象是跨页面 UI 所需的用户摘要；服务器仍校验身份和权限，不以客户端 role 作为授权依据。

`src/pages/stores/currentUser.ts`：

```ts
import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import type { CurrentUser } from '../objects/CurrentUser'

interface CurrentUserState {
  readonly currentUser: CurrentUser | null
}

const currentUserStore = createStore<CurrentUserState>(() => ({ currentUser: null }))

export function getCurrentUser(): CurrentUser | null {
  return currentUserStore.getState().currentUser
}

export function useCurrentUser(): CurrentUser | null {
  return useStore(currentUserStore, state => state.currentUser)
}

export function setCurrentUser(currentUser: CurrentUser | null): void {
  currentUserStore.setState({ currentUser })
}
```

`src/pages/Account/index.tsx`：

```tsx
import { useCurrentUser } from '../stores/currentUser'

export default function Account() {
  const user = useCurrentUser()
  return <p>{user === null ? '未登录' : user.username}</p>
}
```

展示型数据如欢迎语由 user 推导；不要建立额外的 welcomeText 全局状态。纯格式化函数应接收 user 参数，而不是内部调用 useCurrentUser 或读取 Store。普通组件间传值仍用 Props，单次导航参数沿用 Location/路由方式。
