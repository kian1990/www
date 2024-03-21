const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const port = 80;

app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/query', (req, res) => {
  const { username, password, database, table } = req.body;
  const connection = mysql.createConnection({
    host: 'localhost',
    user: username,
    password: password,
    database: database
  });
  connection.connect((err) => {
    if (err) {
      console.error('连接到数据库时出错: ' + err.stack);
      res.status(500).send('连接到数据库时出错');
      return;
    }
    const query = `SELECT * FROM ${table}`;
    connection.query(query, (error, results) => {
      if (error) {
        res.status(500).send('执行查询时出错');
      } else {
        res.json(results);
      }
      connection.end();
    });
  });
});

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const password = req.body.password;
  if (password !== 'root') {
    return res.status(400).send('密码错误');
  }
  res.send('上传成功');
});

app.listen(port, () => {
  console.log(`服务器运行地址: http://0.0.0.0:${port}/`);
});
