const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const User = require('./models/User');

// .env 파일에서 환경 변수를 로드
dotenv.config();

const app = express();

// MongoDB uri는 .env 파일에 저장
const mongoUri = process.env.MONGO_URI;

// MongoDB 연결 설정
mongoose.connect(mongoUri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:')); // 연결 오류 시 메시지 출력
db.once('open', () => {
  console.log('Connected to MongoDB'); // 연결 성공 시 메시지 출력
});

app.use(express.json()); // JSON 형식의 요청 본문을 해석
app.use(express.urlencoded({ extended: false })); // URL-encoded 형식의 요청 본문을 해석
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공
app.set('view engine', 'ejs'); // 뷰 엔진으로 EJS 설정

// 세션 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET, // 세션 암호화에 사용할 비밀 키
    resave: false, // 세션이 수정되지 않아도 세션을 다시 저장할지 여부
    saveUninitialized: false, // 초기화되지 않은 세션을 저장할지 여부
    store: MongoStore.create({ mongoUrl: mongoUri }), // 세션을 MongoDB에 저장
  })
);

// 로그인 상태 확인 미들웨어
const checkAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  }
  try {
    const user = await User.findById(req.session.userId); // 세션에 저장된 사용자 ID로 사용자 찾기
    if (!user) {
      return res.redirect('/auth/login'); // 사용자가 없는 경우 로그인 페이지로 리다이렉트
    }
    req.user = user; // 사용자 정보를 req 객체에 추가
    next();
  } catch (err) {
    console.error(err);
    return res.redirect('/auth/login'); // 오류 발생 시 로그인 페이지로 리다이렉트
  }
};

// 인증 라우트 처리
app.use('/auth', require('./routes/auth'));
// 게시물 라우트 처리
app.use('/posts', checkAuth, require('./routes/posts'));

// 루트 URL 접근 시 로그인 페이지로 리다이렉트
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

const PORT = process.env.PORT || 3000; // 포트 설정 (환경 변수에서 가져오거나 기본값 3000 사용)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // 서버 시작 메시지 출력
});
