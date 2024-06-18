const express = require('express');
const User = require('../models/User');

const router = express.Router();

// 회원가입 페이지 렌더링
router.get('/register', (req, res) => {
  res.render('register'); // register.ejs 템플릿을 렌더링
});

// 로그인 페이지 렌더링
router.get('/login', (req, res) => {
  res.render('login'); // login.ejs 템플릿을 렌더링
});

// 친구 추가 페이지 렌더링
router.get('/add-friend', (req, res) => {
  res.render('addFriend'); // addFriend.ejs 템플릿을 렌더링
});

// 회원가입 처리
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body; // 요청 본문에서 이메일, 사용자 이름, 비밀번호를 추출
  try {
    // 이메일 또는 사용자 이름이 중복되는지 확인
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ msg: '이미 계정이 존재합니다.' }); // 중복되는 경우 오류 메시지 반환
    }
    const newUser = new User({ email, username, password }); // 새 사용자 생성
    await newUser.save(); // 새 사용자를 데이터베이스에 저장
    req.session.userId = newUser._id; // 세션에 사용자 ID 저장
    res.redirect('/posts'); // 게시물 페이지로 리다이렉트
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' }); // 서버 오류 발생 시 오류 메시지 반환
  }
});

// 로그인 처리
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // 요청 본문에서 이메일과 비밀번호를 추출
  try {
    const user = await User.findOne({ email }); // 이메일로 사용자 찾기
    if (!user) {
      return res.status(400).json({ msg: '이메일이 존재하지 않습니다.' }); // 사용자가 존재하지 않는 경우 오류 메시지 반환
    }
    if (password !== user.password) {
      return res.status(400).json({ msg: '비밀번호가 틀렸습니다.' }); // 비밀번호가 일치하지 않는 경우 오류 메시지 반환
    }
    req.session.userId = user._id; // 세션에 사용자 ID 저장
    res.redirect('/posts'); // 게시물 페이지로 리다이렉트
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' }); // 서버 오류 발생 시 오류 메시지 반환
  }
});

// 친구 추가 처리
router.post('/add-friend', async (req, res) => {
  const { username } = req.body; // 요청 본문에서 사용자 이름을 추출
  try {
    const user = await User.findById(req.session.userId); // 세션에 저장된 사용자 ID로 사용자 찾기
    const friend = await User.findOne({ username }); // 친구 이름으로 사용자 찾기
    if (!friend) {
      return res.status(404).json({ msg: 'Friend not found' }); // 친구가 존재하지 않는 경우 오류 메시지 반환
    }
    user.friends.push(friend._id); // 친구 추가
    await user.save(); // 사용자 데이터베이스에 저장
    res.redirect('/posts'); // 게시물 페이지로 리다이렉트
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' }); // 서버 오류 발생 시 오류 메시지 반환
  }
});

module.exports = router; // 라우터를 모듈로 내보냄
