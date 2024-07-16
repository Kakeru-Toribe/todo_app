import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Gateway from '../gateways/';

const gateway = new Gateway('todos');

const TodoDetail = () => {
  const [todo, setTodo] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    gateway.get({ action: 'show', id })
      .then(response => {
        setTodo(response.body);
      })
      .catch(error => console.error('Error fetching todo:', error));
  }, [id]);

  if (!todo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{todo.title}</h1>
      <p>{todo.description}</p>
    </div>
  );
};

export default TodoDetail;