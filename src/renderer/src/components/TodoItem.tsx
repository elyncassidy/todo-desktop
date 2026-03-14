import React from 'react'

type Priority = 'low' | 'medium' | 'high'
type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other'

interface TodoItemProps {
  id: number
  text: string
  done: boolean
  priority: Priority
  category: Category
  dispatch: React.Dispatch<any>
  getCategoryColor: (cat: Category) => string
}

const TodoItem: React.FC<TodoItemProps> = ({
  id,
  text,
  done,
  priority,
  category,
  dispatch,
  getCategoryColor
}) => {
  return (
    <li className={`task-item ${done ? 'completed' : ''}`}>
      <div className="task-content">
        <input
          type="checkbox"
          checked={done}
          onChange={() => dispatch({ type: 'TOGGLE', payload: id })}
          className="task-checkbox"
        />
        <span className="task-text">{text}</span>
      </div>
      <div className="task-meta">
        <span 
          className="category-tag" 
          style={{ backgroundColor: getCategoryColor(category) }}
          title={category}
        >
          {category.slice(0, 1).toUpperCase()}
        </span>
        <select
          value={priority}
          onChange={e => dispatch({ type: 'UPDATE_PRIORITY', id, priority: e.target.value as Priority })}
          className={`priority-select priority-${priority}`}
        >
          <option value="low">Low</option>
          <option value="medium">Med</option>
          <option value="high">High</option>
        </select>
        <button 
          className="btn-delete"
          onClick={() => dispatch({ type: 'DELETE', payload: id })}
          title="Delete task"
        >
          ×
        </button>
      </div>
    </li>
  )
}

export default TodoItem
