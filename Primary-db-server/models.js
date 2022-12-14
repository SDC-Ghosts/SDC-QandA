const db = require("./db.js");
const Promise = require("bluebird");

module.exports = {
  //GET
  getQuestions: (params, res) => {
    const { product_id } = params;
    db.queryAsync(`SELECT id as question_id, JSON_UNQUOTE(question_body) as question_body, date_written, JSON_UNQUOTE(asker_name) as asker_name, helpful from questions where product_id=${product_id} AND reported = 0 ORDER BY helpful desc;`)
      .then((results) => {
        let questions = results[0];

        db.queryAsync(`SELECT id as answer_id, question_id, JSON_UNQUOTE(body) as body, date_written, JSON_UNQUOTE(answerer_name) AS answerer_name, helpful from answers where question_id in (select id from questions where product_id=${product_id}) AND reported=0 ORDER BY helpful desc;`)
          .then((results) => {
            let answers = results[0];

            db.queryAsync(`select answer_id, JSON_UNQUOTE(url) as url from photos where answer_id IN (SELECT id from answers where question_id in (select id from questions where product_id=${product_id}));`)
              .then((results) => {
                let photos = results[0];
                for (let i = 0; i < answers.length; i ++) {
                  answers[i].photos = [];
                  for (let j = 0; j < photos.length; j ++) {
                    if (photos[j].answer_id === answers[i].answer_id) {
                      answers[i].photos.push(photos[j].url);
                    }
                  }
                }
                for (let i = 0; i < questions.length; i ++) {
                  questions[i].answers = {};
                  for (let j = 0; j < photos.length; j ++) {
                    if (answers[j].question_id === questions[i].question_id) {
                      questions[i].answers[answers[j].answer_id] = answers[j];
                    }
                  }
                }
                res.send(questions);
              })
              .catch((err) => console.log('results ', results));
          })
      })
  },

  getAnswers: (params, url, res) => {
    console.log('model accessed, GET request received');
    const { page, count } = params;
    const question_id = url.slice(14, url.length - 8);

    db.queryAsync(`SELECT * FROM answers where question_id=${question_id}`)
      .then((response) => {
        console.log('response', response[0]);
        res.send(response[0]);
      });
  },
  //POST
  postQuestions: (req, res) => {
    const { body, name, email, product_id } = req;
    const date = new Date();
    let queryString = 'INSERT INTO questions(product_id, question_body, date_written, asker_name, asker_email) VALUES(?, ?, ?, ?, ?);';
    db.queryAsync(queryString, [product_id, body, date.toISOString(), name, email])
      .then(() => {
        res.status(201);
        res.send('CREATED')
      });
  },

  postAnswers: (req, url, res) => {
    const { body, name, email, photos } = req;
    console.log(body, photos);
    const question_id = url.slice(14, url.length - 8);
    const date = new Date();

    let queryString = 'INSERT INTO answers(question_id, body, date_written, answerer_name, answerer_email) VALUES (?, ?, ?, ?, ?);';

    db.queryAsync(queryString, [question_id, body, date.toISOString(), name, email])
      .then((response) => {
        const answerId = response[0].insertId;
        let queryString = 'INSERT INTO photos(answer_id, url) values(?, ?);'
        for (let i = 0; i < photos.length; i ++) {
          db.query(queryString, [answerId, photos[i]]);
        }
      })
      .then(() => {
        res.status(201);
        res.send('POST request received')
      });
  },
  //HELPFUL
  helpfulQuestions: (url, res) => {
    const question_id = url.slice(14, url.length - 8);
    db.queryAsync(`UPDATE questions SET helpful=helpful+1 WHERE id=${question_id};`)
      .then(() => {
        res.status(204);
        res.send('NO CONTENT')
      });
  },

  helpfulAnswers: (url, res) => {
    const answer_id = url.slice(12, url.length - 8);
    db.queryAsync(`UPDATE answers SET helpful=helpful+1 WHERE id=${answer_id};`)
      .then(() => {
        res.status(204);
        res.send('NO CONTENT')
      });
  },
  //REPORT
  reportQuestions: (url, res) => {
    const question_id = url.slice(14, url.length - 7);
    db.queryAsync(`UPDATE questions SET reported=1 WHERE id=${question_id};`)
      .then(() => {
        res.status(204);
        res.send('NO CONTENT')
      });
  },

  reportAnswers: (url, res) => {
    const answer_id = url.slice(12, url.length - 7);
    db.queryAsync(`UPDATE answers SET reported=1 WHERE id=${answer_id};`)
      .then(() => {
        res.status(204);
        res.send('NO CONTENT')
      });
  },
}

