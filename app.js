const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
const isValid = require('date-fns/isValid')
const app = express()
app.use(express.json())

let db
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, 'todoApplication.db'),
      driver: sqlite3.Database,
    })
  } catch (e) {
    console.log('DB Error message ${e.message}')
    process.exit(1)
  }
}

app.listen(3000, () => {
  console.log('Server running at http://localshost:3000/')
})

initializeDBAndServer()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return (
    requestQuery.catergory !== undefined && requestQuery.status !== undefined
  )
}

const hasCategoryAndStatus = requestQuery => {
  return (
    requestQuery.catergory !== undefined && requestQuery.status !== undefined
  )
}

const hasCtegoryAndPriority = requestQuery => {
  return (
    requestQuery.catergory !== undefined && requestQuery.priority !== undefined
  )
}

const hasSearchProperty = requestQuery => {
  return requestQuery.search_q !== undefined
}

const hasCategoryProperty = requestQuery => {
  return requestQuery.catergory !== undefined
}

const outputResult = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    catergory: dbObject.catergory,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  }
}

app.get('/todos', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status, catergory} = request.body
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodosQuery = `SELECT * FROM todo WHERE status='${status}' AND priority='${priority}';`
          data = await db.all(getTodosQuery)
          response.send(data.amp(eachItem => outputResult(eachItem)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasCategoryAndStatus(request.query):
      if (
        catergory === 'WORK' ||
        catergory === 'HOME' ||
        catergory === 'LEARNING'
      ) {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodosQuery = `SELECT * FROM todo WHERE category='${catergory}' and status='${status}';`
          data = await db.all(getTodosQuery)
          response.send(data.map(eachItem => outputResult(eachItem)))
        } else {
          response.status(400)
          response.send('Invalid Todos Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todos Category')
      }
      break

    case hasCategoryAndPriority(request.query):
      if (
        catergory === 'WORK' ||
        catergory === 'HOME' ||
        catergory === 'LEARNING'
      ) {
        if (
          priority === 'HIGH' ||
          priority === 'MEDIUM' ||
          priority === 'LOW'
        ) {
          getTodosQuery = `SELECT * FROM todo WHERE category='${catergory}' and priority='${priority}';`
          data = await db.all(getTodosQuery)
          response.send(data.map(eachItem => outputResult(eachItem)))
        } else {
          response.status(400)
          response.send('Invalid Todos Priority')
        }
      } else {
        response.status(400)
        response.send('Invalid Todos Category')
      }
      break

    case hasPriorityProperty(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        getTodosQuery = `SELECT * FROM todo WHERE priority='${priority}';`
        data = await db.all(getTodosQuery)
        response.send(data.map(eachItem => outputResult(eachItem)))
      } else {
        response.status(400)
        response.send('Invalid Todos Priority')
      }
      break

    case hasStatusProperty(request.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        getTodosQuery = `SELECT * FROM todo WHERE status='${status}';`
        data = await db.all(getTodosQuery)
        response.send(data.map(eachItem => outputResult(eachItem)))
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break

    case hasSearchProperty(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE todo like '%${search_q}%';`
      data = await db.al(getTodosQuery)
      response.send(data.map(eachItem => outputResult(eachItem)))
      break

    case hasCategoryProperty(request.query):
      if (
        catergory === 'WORK' ||
        catergory === 'HOME' ||
        catergory === 'LEARNING'
      ) {
        getTodosQuery = `SELECT * FROM todo WHERE category='${catergory}';`
        data = await db.all(getTodosQuery)
        response.send(data.map(eachItem => outputResult(eachItem)))
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break

    default:
      getTodosQuery = `SELECT * FROM todo;`
      data = await db.all(getTodosQuery)
      response.send(data.map(eachItem => outputResult(eachItem)))
  }

  app.get('/todos/:todoId/', async (request, response) => {
    const {todoId} = request.params
    const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`
    const responseResult = await db.get(getTodoQuery)
    response.send(outputResult(responseResult))
  })

  app.get('/agenda/',async(request,response)=>{
     const {date} = request.query
     console.log(isMatch(date,"yyyy-MM-dd"))
     if(isMatch(date,"yyyy-MM-dd")){
        const newDate = format(new Date(date),"yyyy-MM-dd")
        console.log(newDate)
        const requestQuery = `select * from todo where due_date='${newDate}';`
        const responseResult = await db.all(requestQuery)
        response.send(responseResult.map(eachItem)=> outputResult(eachItem))
     }else{
        response.status(400)
        response.send('Invalid Due Date')
     }
  })
  
  app.post('/todos/',async(request,response)=>{
    const{id, todo, priority,status,catergory,dueDate} = request.body
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
       if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
          if (
        catergory === 'WORK' ||
        catergory === 'HOME' ||
        catergory === 'LEARNING'
      ) {
        if(isMatch(date,"yyyy-MM-dd")){
            const postNewDate = format(new Date(dueDate),"yyyy-MM-dd")
            const postTodoQuery = `INSERT INTO todo (id,todo,category,priority,status,due_date) VALUES(${id},'${todo}','${catergory}','${priority}','${status}','${postNewDate}');`
            await db.run(postTodoQuery)
            response.send('Todo Successfully Added')
        }else{
            response.status(400)
            response.send('Invalid Due Date')
        }
      }else{
        response.status(400)
        response.send('Invalid Todo Category')
      }
       } else{
        response.status(400)
        response.send('Invalid Todo Status')
       }
      }else{
        response.status(400)
        response.send('Invalid Todo Priority') 
      }
  })

  app.put('/todos/:todoId/',async(request,response)=>{
    const {todoId} = request.params
    let updateColumn = ""
    const requestBody = request.body
    console.log(requestBody)
    const previousTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`
    const previousTodo = await db.get(previousTodoQuery)
    const {
        todo = previousTodo.todo,
        priority = previousTodo.priority,
        status = previousTodo.status,
        catergory = previousTodo.catergory,
        dueDate = previousTodo.dueDate
    }=request.body
    let updateTodoQuery 
    switch(true){
        case requestBody.status!== undefined:
        if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
            updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}',status='${status}',category='${catergory}',due_date='${dueDate}' WHERE id=${todoId};`
            await db.run(updateTodoQuery)
            response.send('Status Updated')
        }else{
            response.status(400)
            response.send('Invalid Todo Status')
        }
        break;
        
    }
  })


})
