const express = require('express');
const cors = require('cors');

const { v4: uuidv4, validate } = require('uuid');

const getTodoById = require('./utils/getTodoById');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  
  const user = users.find( user => user.username === username)

  if(!user){
    return response.status(404).json({
      error: "username not found"
    })
  }
  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body

  const userAlreadyExists = users.some( user => user.username === username)
  if(userAlreadyExists) {
    return response.status(400).json({
      error: "User already exists"
    })
  }
  
  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

//todos

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const deadlineFormat = new Date(deadline).toISOString()
  const dateFormatted = new Date().toISOString()
  const newTodo = {
    title: title,
    deadline: deadlineFormat,
    id: uuidv4(),
    done: false,
    created_at: dateFormatted,
  }

  user.todos.push(newTodo)
  

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user
  const { id } = request.params
  
  const todoToUpdate = getTodoById(todos, id);

  if(!todoToUpdate){
    return response.status(404).json({
      error: "todo not found"
    })
  }

  const { title, deadline } = request.body
  if( !title || !deadline ){
    return response.status(400).json({
      error: "invalidate body"
    })
  }

  todoToUpdate.title = title;
  todoToUpdate.deadline = new Date(deadline).toISOString();

 
  
  
  return response.status(200).json(todoToUpdate)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params
  
  const todo = getTodoById(user.todos, id);
   if(!todo) {
     return response.status(404).json({
       error: "todo not found"
     })
   }

  todo.done = true
  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;

  const todo = getTodoById(todos, id);
  if(!todo) {
    return response.status(404).json({
      error: "todo not found"
    })
  }

  todos.splice(todo, 1);

  return response.status(204).end()

});

module.exports = app;