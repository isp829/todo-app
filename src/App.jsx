import { useState, useEffect } from 'react'
import './App.css'
import Weather from './Weather'

const CATEGORIES = [
  { id: 'all',      label: '전체' },
  { id: 'work',     label: '업무' },
  { id: 'personal', label: '개인' },
  { id: 'study',    label: '학습' },
]

const SORT_OPTIONS = [
  { id: 'none',    label: '기본순' },
  { id: 'asc',     label: '마감 빠른순' },
  { id: 'desc',    label: '마감 느린순' },
]

const today = () => new Date().toISOString().split('T')[0]

const isOverdue = (dueDate, done) =>
  !done && dueDate && dueDate < today()

const formatDate = (dateStr) => {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-')
  return `${y}.${m}.${d}`
}

const dueDateStatus = (dueDate, done) => {
  if (!dueDate || done) return null
  if (dueDate < today()) return 'overdue'
  if (dueDate === today()) return 'today'
  return null
}

function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('todos')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [input, setInput]       = useState('')
  const [category, setCategory] = useState('work')
  const [dueDate, setDueDate]   = useState('')
  const [filter, setFilter]     = useState('all')
  const [sortBy, setSortBy]     = useState('none')
  const [dark, setDark]         = useState(() => localStorage.getItem('darkMode') === 'true')

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('darkMode', dark)
  }, [dark])

  const addTodo = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setTodos([...todos, {
      id: crypto.randomUUID(),
      text: trimmed,
      done: false,
      category,
      dueDate: dueDate || null,
    }])
    setInput('')
    setDueDate('')
  }

  const toggleTodo = (id) =>
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))

  const deleteTodo = (id) =>
    setTodos(todos.filter(t => t.id !== id))

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTodo()
  }

  const getCategoryLabel = (id) => CATEGORIES.find(c => c.id === id)?.label ?? id

  // 필터
  const filtered = filter === 'all'
    ? todos
    : todos.filter(t => t.category === filter)

  // 정렬
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'none') return 0
    const da = a.dueDate ?? '9999-99-99'
    const db = b.dueDate ?? '9999-99-99'
    return sortBy === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
  })

  const remaining = todos.filter(t => !t.done).length
  const overdueCount = todos.filter(t => isOverdue(t.dueDate, t.done)).length

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1 className="title">To-Do List</h1>
          <button
            className="dark-toggle"
            onClick={() => setDark(d => !d)}
            aria-label={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            <span className="toggle-icon">{dark ? '☀️' : '🌙'}</span>
          </button>
        </div>
        <Weather />

        {/* 카테고리 필터 탭 */}
        <div className="filter-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`filter-tab ${filter === cat.id ? 'active' : ''}`}
              onClick={() => setFilter(cat.id)}
            >
              {cat.label}
              <span className="tab-count">
                {cat.id === 'all'
                  ? todos.length
                  : todos.filter(t => t.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* 입력 영역 */}
        <div className="input-row">
          <input
            className="text-input"
            type="text"
            placeholder="할 일을 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <select
            className="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <button className="add-btn" onClick={addTodo}>추가</button>
        </div>

        {/* 날짜 + 정렬 행 */}
        <div className="meta-row">
          <div className="date-wrap">
            <label className="date-label" htmlFor="due-date">마감일</label>
            <input
              id="due-date"
              className="date-input"
              type="date"
              value={dueDate}
              min={today()}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="sort-wrap">
            <label className="date-label" htmlFor="sort">정렬</label>
            <select
              id="sort"
              className="category-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 요약 */}
        <div className="summary-row">
          <p className="count">남은 할 일: <strong>{remaining}개</strong></p>
          {overdueCount > 0 && (
            <p className="overdue-count">기한 초과: <strong>{overdueCount}개</strong></p>
          )}
        </div>

        {/* 할 일 목록 */}
        <ul className="todo-list">
          {sorted.length === 0 && (
            <li className="empty">
              {filter === 'all' ? '할 일을 추가해보세요!' : `${getCategoryLabel(filter)} 항목이 없습니다.`}
            </li>
          )}
          {sorted.map(todo => {
            const status = dueDateStatus(todo.dueDate, todo.done)
            return (
              <li
                key={todo.id}
                className={[
                  'todo-item',
                  todo.done ? 'done' : '',
                  status === 'overdue' ? 'overdue' : '',
                  status === 'today'   ? 'due-today' : '',
                ].filter(Boolean).join(' ')}
              >
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                  className="checkbox"
                  aria-label={`${todo.text} 완료 체크`}
                />
                <div className="todo-body">
                  <span className="todo-text">{todo.text}</span>
                  {todo.dueDate && (
                    <span className={`due-date-badge ${status ?? ''}`}>
                      {status === 'overdue' && '⚠ '}
                      {status === 'today'   && '● '}
                      {formatDate(todo.dueDate)}
                    </span>
                  )}
                </div>
                <span className={`category-badge category-${todo.category}`}>
                  {getCategoryLabel(todo.category)}
                </span>
                <button
                  className="delete-btn"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`${todo.text} 삭제`}
                >✕</button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default App
