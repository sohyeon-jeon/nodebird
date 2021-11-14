const express = require('express');
const cookieParser = require('cookie-parser');
//morgan : 기존 로그 외에 추가적인 로그를 볼 수 있음
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
// dotenv(.env 파일을 읽어서 process.env로 만듬) 
// process.env.COOKIE_SECRET에 cookiesecret 값 할당(키=값 형식)
//보안상 이유로 dotenv 패키지로 비밀 키를 로딩하는 방식으로 관리
const dotenv = require('dotenv');

dotenv.config();
const pageRouter = require('./routes/page');

const app = express();
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

app.use(morgan('dev'));
// static미들웨어는 정적인 파일을 제공하는 라우터 역할
// public/stylesheets/style.css는 http://localhost:3000/stylesheets/style.css로 접근 가능
// 실제 서버 경로에는 public이 들어있지만, 요청주소는 public이 들어있지않음(보안상 좋음)
app.use(express.static(path.join(__dirname, 'public')));
//body-parser : 요청의 본문에 있는 데이터를 해석해서 req.body로 만들어주는 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser(비밀키))
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  //cookieParser 비밀키와 동일하게 해주는 것을 권장
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

app.use('/', pageRouter);

app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});