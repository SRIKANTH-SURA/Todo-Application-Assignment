const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const changeDBObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date
  };
};

const hasStatusAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};

const hasStatusAndCategoryProperties = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.category !== undefined
  );
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

// API 1

app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q = "" } = request.query;
  console.log(request.query);

  let getTodosQuery;
  switch (true) {
    case hasStatusAndPriorityProperties(request.query):
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE todo LIKE '%${search_q}%' AND
              status = "${status}" AND
              priority = "${priority}";
        `;
      break;

    case hasStatusAndCategoryProperties(request.query):
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE todo LIKE '%${search_q}%' AND
              status = "${status}" AND
              category = "${category}";
        `;
      break;

    case hasCategoryAndPriorityProperties(request.query):
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE todo LIKE '%${search_q}%' AND
              priority = "${priority}" AND
              category = "${category}";
        `;
      break;

    case hasStatusProperty(request.query):
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE todo LIKE '%${search_q}%' AND
              status = "${status}";
        `;
      break;

    case hasPriorityProperty(request.query):
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE todo LIKE '%${search_q}%' AND
              priority = "${priority}";
        `;
      break;

    case hasCategoryProperty(request.query):
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE todo LIKE '%${search_q}%' AND
              category = "${category}";
        `;
      break;

    default:
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE todo LIKE '%${search_q}%';
        `;
      break;
  }

  const todoArray = await db.all(getTodosQuery);
  response.send(
    todoArray.map((each_object) => changeDBObjectToResponseObject(each_object))
  );
});

module.exports = app;
