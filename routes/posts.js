const express = require('express');
const multer = require('multer');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // 파일 업로드 경로 설정
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // 파일 이름 설정 (현재 시간 + 원본 파일 이름)
  },
});

const upload = multer({ storage }); // Multer 미들웨어 설정

// 게시물 작성 페이지 렌더링
router.get('/create', (req, res) => {
  res.render('createPost'); // createPost.ejs 템플릿을 렌더링
});

// 게시물 작성 처리
router.post('/', upload.single('image'), async (req, res) => {
  const { caption } = req.body; // 요청 본문에서 캡션을 추출
  const imageUrl = `/uploads/${req.file.filename}`; // 업로드된 이미지의 URL 설정
  try {
    const newPost = new Post({
      caption,
      imageUrl,
      user: req.session.userId, // 세션에서 사용자 ID 가져오기
    });
    await newPost.save(); // 새 게시물을 데이터베이스에 저장
    res.redirect('/posts'); // 게시물 페이지로 리다이렉트
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' }); // 서버 오류 발생 시 오류 메시지 반환
  }
});

// 게시물 수정 페이지 렌더링
router.get('/edit/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); // 게시물 ID로 게시물 찾기
    if (!post) {
      return res.status(404).json({ msg: '게시물을 못찾았습니다.' }); // 게시물이 없는 경우 오류 메시지 반환
    }
    res.render('editPost', { post }); // editPost.ejs 템플릿을 렌더링
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' }); // 서버 오류 발생 시 오류 메시지 반환
  }
});

// 게시물 수정 처리
router.post('/edit/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); // 게시물 ID로 게시물 찾기
    if (!post) {
      return res.status(404).json({ msg: '게시물을 못찾았습니다' }); // 게시물이 없는 경우 오류 메시지 반환
    }
    post.caption = req.body.caption; // 게시물 캡션 업데이트
    await post.save(); // 변경된 게시물 데이터베이스에 저장
    res.redirect('/posts'); // 게시물 페이지로 리다이렉트
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' }); // 서버 오류 발생 시 오류 메시지 반환
  }
});

// 게시물 삭제 처리
router.post('/delete/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id); // 게시물 ID로 게시물 삭제
    res.redirect('/posts'); // 게시물 페이지로 리다이렉트
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' }); // 서버 오류 발생 시 오류 메시지 반환
  }
});

// 게시물 페이지 렌더링
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('friends'); // 세션에서 사용자 ID로 사용자 찾기 및 친구 목록 포함
    const friendIds = user.friends.map((friend) => friend._id); // 친구들의 ID 목록 가져오기
    const posts = await Post.find({
      user: { $in: [req.session.userId, ...friendIds] }, // 사용자 및 친구들의 게시물 찾기
    }).sort({ createdAt: -1 }).populate('user'); // 게시물의 작성자를 포함하여 가져오기
    const friends = await User.find({ _id: { $in: friendIds } }); // 친구 목록 가져오기
    res.render('index', { posts, user, friends }); // 사용자 정보를 템플릿으로 전달하여 index.ejs 템플릿을 렌더링
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' }); // 서버 오류 발생 시 오류 메시지 반환
  }
});

module.exports = router; // 라우터를 모듈로 내보냄
