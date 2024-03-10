import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {FaStar} from "react-icons/fa";

interface TodoItem {
  id: number;
  content: string;
  priority: number;
  completed: boolean;
  added_date: string;
}
const Stars = ({ count }) => {
  // 创建一个数组来存储星星组件
  const stars = [];

  for (let i = 0; i < count; i++) {
    stars.push(<FaStar key={i} />);
  }

  return <div className='flex text-yellow-500'>{stars}</div>;
};

export default function App() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [todoContent, setTodoContent] = useState('');
  const [todoPriority, setTodoPriority] = useState(1);

  useEffect(() => {
    axios.get('http://localhost:3001/todos')
      .then(response => setTodos(response.data.map((todo: TodoItem) => (todo.added_date = new Date().toISOString().split('T')[0], todo))))
      .catch(error => console.error('Error fetching todos:', error));
  }, []);

  const handleAddTodo = async () => {
    try {
      const response = await axios.post('http://localhost:3001/todos', {
        content: todoContent,
        priority: todoPriority,
        completed: false
      });
      setTodos(prevTodos => [response.data, ...prevTodos]);
      setTodoContent('');
      setTodoPriority(1);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  // const handleDeleteTodo = async (id: number) => {
  //   try {
  //     await axios.delete(`http://localhost:3001/todos/${id}`);
  //     setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  //   } catch (error) {
  //     console.error('Error deleting todo:', error);
  //   }
  // };

  const handleToggleCompletion = async (id: number) => {
    try {
      // Find the todo to update
      const todoToUpdate = todos.find(todo => todo.id === id);
      if (!todoToUpdate) {
        return;
      }
      // Send update to server
      const response = await axios.patch(`http://localhost:3001/todos/${id}`, {
        completed: !todoToUpdate.completed
      });
      // Update state
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? { ...todo, completed: response.data.completed } : todo
        )
      );
    } catch (error) {
      console.error('Error toggling todo completion:', error);
    }
  };

  return (
    <div className="App">
  <h1 className="text-2xl font-bold underline text-center my-4">
    TODOs List
  </h1>
  <div className="add-todo-form mx-auto max-w-lg">
    <div className="flex gap-2">
      <input
        type="text"
        className="border p-1 flex-1"
        placeholder="Enter a new todo..."
        value={todoContent}
        onChange={(e) => setTodoContent(e.target.value)}
      />
      <select
        className="border p-1"
        value={todoPriority}
        onChange={(e) => setTodoPriority(Number(e.target.value))}
      >
        <option value="1">1 Star</option>
        <option value="2">2 Stars</option>
        <option value="3">3 Stars</option>
        <option value="4">4 Stars</option>
        <option value="5">5 Stars</option>
      </select>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
        onClick={handleAddTodo}
      >
        Add Todo
      </button>
    </div>
  </div>
  <div className="todo-list mt-4 mx-auto max-w-lg">
    {todos.filter(todo => !todo.completed).sort((a, b) => b.priority - a.priority).map(todo => (
      <div key={todo.id} className="flex items-center justify-between bg-white shadow-md rounded p-2 my-2">
        <div style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
          <p className="text-lg">{todo.content}</p>
          <p className="text-sm text-gray-500">
            Added on {todo.added_date ? todo.added_date : "Loading date..."}
          </p>
          <Stars count={todo.priority} />
        </div>
        <div>
          <button onClick={() => handleToggleCompletion(todo.id)} className="p-1 m-1 bg-green-500 text-white rounded">
            {todo.completed ? 'Undo' : 'Complete'}
          </button>
        </div>
      </div>
    ))}
  </div>
</div>
  );
}