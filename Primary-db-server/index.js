require("dotenv").config();
const express=require("express");
const path = require("path");
const db = require("./db.js");
const models = require("./models.js");

const app = express();

app.use(express.json());

app.listen(process.env.PORT);
console.log(`Listening at http://localhost:${process.env.PORT}`);


// ROUTER FUNCTIONS
//GET
app.get('/qa/questions', (req, res) => {
  models.getQuestions(req.query, res);
})

app.get('/qa/questions/*/answers', (req, res) => {
  models.getAnswers(req.query, req.url, res);

})

//POST
app.post('/qa/questions', (req, res) => {
  models.postQuestions(req.body, res);
})

app.post('/qa/questions/*/answers', (req, res) => {
  models.postAnswers(req.body, req.url, res);
})

//PUT - HELPFUL
app.put('/qa/questions/*/helpful', (req, res) => {
  models.helpfulQuestions(req.url, res);
})

app.put('/qa/answers/*/helpful', (req, res) => {
  models.helpfulAnswers(req.url, res);
})

//PUT - REPORT
app.put('/qa/questions/*/report', (req, res) => {
  models.reportQuestions(req.url, res);
})

app.put('/qa/answers/*/report', (req, res) => {
  models.reportAnswers(req.url, res);
})