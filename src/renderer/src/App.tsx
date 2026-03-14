import { useState, useEffect, useReducer } from 'react'
import './App.css'
import TodoItem from './components/TodoItem'
import { format } from "date-fns"

type Priority = 'low' | 'medium' | 'high'
type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other'
type FilterType = 'all' | 'active' | 'completed'

interface Todo {
  id: number
  text: string
  done: boolean
  priority: Priority
  category: Category
  createdAt: number
}

type TodoAction = 
  | { type: 'ADD'; payload: Todo }
  | { type: 'TOGGLE'; payload: number }
  | { type: 'DELETE'; payload: number }
  | { type: 'SET_ALL'; payload: Todo[] }
  | { type: 'UPDATE_PRIORITY'; id: number; priority: Priority }

function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'ADD':
      return [action.payload, ...state]
    case 'TOGGLE':
      return state.map(t => t.id === action.payload ? { ...t, done: !t.done } : t)
    case 'DELETE':
      return state.filter(t => t.id !== action.payload)
    case 'UPDATE_PRIORITY':
      return state.map(t => t.id === action.id ? { ...t, priority: action.priority } : t)
    case 'SET_ALL':
      return action.payload
    default:
      return state
  }
}

function App(): JSX.Element {
  const [todos, dispatch] = useReducer(todoReducer, [])
  const [input, setInput] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium')
  const [selectedCategory, setSelectedCategory] = useState<Category>('personal')
  const [filter, setFilter] = useState<FilterType>('all')

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('todos')
    if (saved) {
      dispatch({ type: 'SET_ALL', payload: JSON.parse(saved) })
    }
  }, [])

  // Save to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = (): void => {
    if (!input.trim()) return
    const newTodo: Todo = {
      id: Date.now(),
      text: input.trim(),
      done: false,
      priority: selectedPriority,
      category: selectedCategory,
      createdAt: Date.now()
    }
    dispatch({ type: 'ADD', payload: newTodo })
    setInput('')
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.done
    if (filter === 'completed') return todo.done
    return true
  })

  const completedCount = todos.filter(t => t.done).length
  const totalCount = todos.length

  const getCategoryColor = (cat: Category): string => {
    const colors: Record<Category, string> = {
      work: '#3b82f6',
      personal: '#ec4899',
      shopping: '#f59e0b',
      health: '#10b981',
      other: '#8b5cf6'
    }
    return colors[cat]
  }

  const getPriorityLabel = (p: Priority): string => {
    return p.charAt(0).toUpperCase() + p.slice(1)
  }

  return (
    <div className="app-container">
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1>✓ Task Master 1.1.0</h1>
            <p>Today: {format(new Date(), "PPP")}</p>
            <p className="subtitle">Stay organized, get things done</p>
          </div>
          <div className="stats">
            <div className="stat">
              <span className="stat-value">{totalCount}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat">
              <span className="stat-value">{completedCount}</span>
              <span className="stat-label">Done</span>
            </div>
          </div>
        </header>

        <section className="input-section">
          <div className="input-group">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="Add a new task..."
              className="task-input"
            />
            <button onClick={addTodo} className="btn-add">
              <span>+</span> Add
            </button>
          </div>

          <div className="options-row">
            <div className="option-group">
              <label>Priority:</label>
              <select 
                value={selectedPriority} 
                onChange={e => setSelectedPriority(e.target.value as Priority)}
                className="select-priority"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="option-group">
              <label>Category:</label>
              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value as Category)}
                className="select-category"
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="shopping">Shopping</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </section>

        <section className="filter-section">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </section>

        <section className="tasks-section">
          {filteredTodos.length === 0 && (
            <div className="empty-state">
              <p className="empty-icon">📭</p>
              <p className="empty-text">
                {filter === 'all' ? 'No tasks yet. Create one to get started!' : `No ${filter} tasks`}
              </p>
            </div>
          )}

          <ul className="tasks-list">
            {filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                id={todo.id}
                text={todo.text}
                done={todo.done}
                priority={todo.priority}
                category={todo.category}
                dispatch={dispatch}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </ul>
        </section>

        <footer className="app-footer">
          <p>
            {filter === 'all' ? (
              <>
                <strong>{completedCount}</strong> of <strong>{totalCount}</strong> tasks completed
              </>
            ) : (
              `Showing ${filteredTodos.length} ${filter} task${filteredTodos.length !== 1 ? 's' : ''}`
            )}
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App