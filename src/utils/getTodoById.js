
function getTodoById(todos, id) {
  const todo = todos.find( todo => {
    return todo.id === id;
  })

  return todo;
}


module.exports = getTodoById