require('dotenv').config();

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const HTTP_PORT = process.env.HTTP_PORT || 8080;
const app = express();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use((req, res, next) => {
  const corsWhiteList = ['https://willbeai.ru', 'http://localhost:5173', 'https://localhost:5173'];

  if (corsWhiteList.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    res.setHeader('Access-Control-Allow-Credentials', true);
  }

  next();
});

app.post('/request', async (req, res) => {
  try {
    const { fio, phone, email, brief } = req.body;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'Заявка | WillBe AI',
      text: `
              ФИО: ${fio}
              Телефон: ${phone}
              Email: ${email}
              Бриф: ${brief}
        `,
    });

    return res.status(200).send('Заявка отправлена');
  } catch (e) {
    console.log(e);
    return res.status(500).send('Произошла ошибка');
  }
});

const httpServer = http.createServer(app);

httpServer.listen(HTTP_PORT, async () => {
  console.log(`HTTP Server running on port ${HTTP_PORT}`);
});
