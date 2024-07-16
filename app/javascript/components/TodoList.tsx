import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Gateway from '../gateways/';

const gateway = new Gateway('todos');

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });

  useEffect(() => {
    gateway.get({ action: 'index' })
      .then(response => {
        setTodos(response.body);
      })
      .catch(error => console.error('Error fetching todos:', error));
  }, []);

  const handleAddTodo = () => {
    gateway.post({ action: 'create'}, newTodo)
      .then(response => {
        setTodos([...todos, response.body]);
        setNewTodo({ title: '', description: '' });
      })
      .catch(error => console.error('Error adding todo:', error));
  };

  const handleDeleteTodoById = (id: number) => {
    gateway.delete({ action: 'destroy', id: id })
      .then(() => {
        setTodos(todos.filter((todo: { id: number }) => todo.id !== id));
      })
      .catch(error => console.error('Error deleting todo:', error));
  };

  const handleDeleteCheckedTodos = () => {
    const checkedTodos = todos.filter((todo: { checked: boolean }) => todo.checked);
    checkedTodos.forEach((todo: { id: number }) => handleDeleteTodoById(todo.id));
  };

  const handleCheckboxChange = (e, id: number) => {
    setTodos(todos.map((todo: { id: number }) => 
      todo.id === id ? { ...todo, checked: e.target.checked } : todo
    ));
  };

  return (
    <div className="todo-list-container">
      <h1 className="todo-list-header">Todo List
        <button onClick={handleDeleteCheckedTodos} className="todo-delete-button">
          <img src={require('../../assets/images/icons8-delete.svg')} alt="削除" />
        </button>
      </h1>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className="todo-item">
            <input type="checkbox" onChange={(e) => handleCheckboxChange(e, todo.id)} />
            <Link to={`/todos/${todo.id}`}>{todo.title}</Link>
          </li>
        ))}
      </ul>
      <h2>New Todo</h2>
      <div className="todo-inputs">
        <input
          type="text"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          placeholder="新しいTodoのタイトルを入力"
          className="todo-input"
        />
        <textarea
          value={newTodo.description}
          onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          placeholder="新しいTodoの詳細を入力"
          className="todo-textarea"
        />
        <button onClick={handleAddTodo} className="todo-button">登録</button>
      </div>
    </div>
  );
};

export default TodoList;