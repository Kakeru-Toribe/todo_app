import React from "react";
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
import TodoList from './TodoList';
import TodoDetail from './TodoDetail';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TodoList />} />
      <Route path="/todos/:id" element={<TodoDetail />} />
      </Routes>
    </Router>
  );
};

export default App;